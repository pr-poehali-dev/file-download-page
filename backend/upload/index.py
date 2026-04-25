import base64
import json
import os
import uuid

import boto3
import psycopg2


def handler(event: dict, context) -> dict:
    """Загружает файл в S3 и сохраняет запись в БД. Требует пароль администратора."""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    body = json.loads(event.get("body") or "{}")

    # Проверка пароля
    if body.get("password") != os.environ["ADMIN_PASSWORD"]:
        return {"statusCode": 403, "headers": headers, "body": json.dumps({"error": "Неверный пароль"})}

    # DELETE — удалить файл
    if event.get("httpMethod") == "DELETE":
        file_id = body.get("id")
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        cur.execute(f"DELETE FROM t_p60878145_file_download_page.files WHERE id = {int(file_id)}")
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True})}

    # POST — загрузить файл
    filename = body.get("filename", "file")
    content_type = body.get("content_type", "application/octet-stream")
    file_data = base64.b64decode(body.get("data", ""))
    size_bytes = len(file_data)

    if size_bytes < 1024:
        size_str = f"{size_bytes} Б"
    elif size_bytes < 1024 * 1024:
        size_str = f"{size_bytes // 1024} КБ"
    else:
        size_str = f"{round(size_bytes / (1024 * 1024), 1)} МБ"

    key = f"downloads/{uuid.uuid4()}_{filename}"
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=key, Body=file_data, ContentType=content_type)
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    fn_esc = filename.replace("'", "''")
    url_esc = cdn_url.replace("'", "''")
    size_esc = size_str.replace("'", "''")
    cur.execute(
        f"INSERT INTO t_p60878145_file_download_page.files (name, url, size) VALUES ('{fn_esc}', '{url_esc}', '{size_esc}') RETURNING id"
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"id": new_id, "name": filename, "url": cdn_url, "size": size_str, "downloads": 0}),
    }