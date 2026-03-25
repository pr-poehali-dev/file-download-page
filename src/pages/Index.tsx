import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

interface FileItem {
  id: number;
  name: string;
  url: string;
  size: string;
  downloads: number;
}

const FILES_URL = "https://functions.poehali.dev/4f85cd65-b9b3-4d92-88ae-e1869cd8c236";
const UPLOAD_URL = "https://functions.poehali.dev/0189ca45-425c-41e7-96ed-aa96a392a72f";

export default function Index() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(FILES_URL)
      .then((r) => r.json())
      .then(setFiles)
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    // Проверяем пароль без загрузки файла — через DELETE с несуществующим id
    const res = await fetch(UPLOAD_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: -1 }),
    });
    if (res.status === 403) {
      setLoginError("Неверный пароль");
      return;
    }
    sessionStorage.setItem("adminPass", password);
    setIsAdmin(true);
    setShowLogin(false);
    setPassword("");
    setLoginError("");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = await file.arrayBuffer();
    // Безопасная конвертация в base64 для больших файлов
    const bytes = new Uint8Array(data);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: sessionStorage.getItem("adminPass"),
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        data: base64,
      }),
    });
    const newFile = await res.json();
    setFiles((prev) => [newFile, ...prev]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: number) => {
    await fetch(UPLOAD_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: sessionStorage.getItem("adminPass"), id }),
    });
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setDeleteId(null);
  };

  const handleDownload = async (id: number) => {
    await fetch(FILES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, downloads: f.downloads + 1 } : f))
    );
  };

  const doLogin = () => {
    sessionStorage.setItem("adminPass", password);
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-6 py-16">

        {/* Заголовок */}
        <div className="text-center mb-14">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground whitespace-pre-line leading-tight">
            {"Скачать автокликер MAKS\nDownload MAKS autoclicker"}
          </h1>
          <p className="mt-4 text-base font-semibold leading-relaxed" style={{ color: "#1a5c2e" }}>
            Рекомендуется скачивать самую новую версию программы, так как она дополнена новыми функциями, а так же, устранены недостатки и ошибки предыдущих версий.
            <br />
            It is recommended to download the latest version of the program, as it is supplemented with new features, as well as, eliminated the shortcomings and errors of previous versions.
          </p>
        </div>

        {/* Список файлов */}
        <div className="divide-y divide-border border-t border-border">
          {files.length === 0 && (
            <p className="py-10 text-sm text-muted-foreground">
              Файлы ещё не добавлены
            </p>
          )}
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between py-4 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Icon name="FileText" size={18} className="text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{file.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {file.size && <span>{file.size}</span>}
                    <span className="flex items-center gap-0.5">
                      <Icon name="Download" size={11} />
                      {file.downloads}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isAdmin && (
                  <button
                    onClick={() => setDeleteId(file.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Icon name="Trash2" size={15} />
                  </button>
                )}
                <a
                  href={file.url}
                  download
                  onClick={() => handleDownload(file.id)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium border border-border rounded-sm text-foreground hover:bg-foreground hover:text-primary-foreground transition-colors"
                >
                  <Icon name="Download" size={13} />
                  Скачать
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка добавить файл (только для админа) */}
        {isAdmin && (
          <div className="mt-6">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-border rounded-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-50"
            >
              <Icon name={uploading ? "Loader2" : "Plus"} size={16} className={uploading ? "animate-spin" : ""} />
              {uploading ? "Загрузка..." : "Добавить файл"}
            </button>
          </div>
        )}

        {/* Кнопка входа */}
        {!isAdmin && (
          <div className="mt-10 flex justify-end">
            <button
              onClick={() => setShowLogin(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Войти
            </button>
          </div>
        )}

        {/* Форма входа */}
        {showLogin && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-sm border border-border p-8 w-80 shadow-lg">
              <h2 className="text-base font-semibold mb-5">Вход для администратора</h2>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                autoFocus
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
                className="w-full px-3 py-2 text-sm border border-border rounded-sm outline-none focus:border-foreground transition-colors mb-2"
              />
              {loginError && (
                <p className="text-xs text-destructive mb-3">{loginError}</p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={doLogin}
                  className="flex-1 py-2 text-sm font-medium bg-foreground text-primary-foreground rounded-sm hover:opacity-80 transition-opacity"
                >
                  Войти
                </button>
                <button
                  onClick={() => { setShowLogin(false); setLoginError(""); setPassword(""); }}
                  className="flex-1 py-2 text-sm border border-border rounded-sm hover:bg-accent transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Подтверждение удаления */}
        {deleteId !== null && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-sm border border-border p-8 w-72 shadow-lg">
              <p className="text-sm mb-6">Удалить этот файл?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2 text-sm font-medium bg-destructive text-white rounded-sm hover:opacity-80 transition-opacity"
                >
                  Удалить
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2 text-sm border border-border rounded-sm hover:bg-accent transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}