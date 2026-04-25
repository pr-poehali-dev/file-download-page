import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Возвращает список файлов и обрабатывает скачивание (увеличивает счётчик)."""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    # POST — увеличить счётчик скачиваний
    if event.get("httpMethod") == "POST":
        body = json.loads(event.get("body") or "{}")
        file_id = body.get("id")
        cur.execute(
            f"UPDATE t_p60878145_file_download_page.files SET downloads = downloads + 1 WHERE id = {int(file_id)}"
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True})}

    # GET — список файлов
    cur.execute(
        "SELECT id, name, url, size, downloads FROM t_p60878145_file_download_page.files ORDER BY created_at DESC"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    files = [
        {"id": r[0], "name": r[1], "url": r[2], "size": r[3], "downloads": r[4]}
        for r in rows
    ]
    return {"statusCode": 200, "headers": headers, "body": json.dumps(files)}