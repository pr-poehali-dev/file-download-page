import { useState } from "react";
import Icon from "@/components/ui/icon";

interface FileItem {
  id: number;
  name: string;
  url: string;
}

const initialFiles: FileItem[] = [];

export default function Index() {
  const [heading, setHeading] = useState("Введите заголовок");
  const [editingHeading, setEditingHeading] = useState(false);
  const [files] = useState<FileItem[]>(initialFiles);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-6 py-16">

        {/* Редактируемый заголовок */}
        {editingHeading ? (
          <input
            autoFocus
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            onBlur={() => setEditingHeading(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingHeading(false)}
            className="w-full text-3xl font-semibold tracking-tight text-foreground bg-transparent border-b border-foreground outline-none pb-1 mb-10"
          />
        ) : (
          <h1
            onClick={() => setEditingHeading(true)}
            className="text-3xl font-semibold tracking-tight text-foreground mb-10 cursor-text hover:opacity-70 transition-opacity"
          >
            {heading}
          </h1>
        )}

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
                <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
              </div>
              <a
                href={file.url}
                download
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium border border-border rounded-sm text-foreground hover:bg-foreground hover:text-primary-foreground transition-colors"
              >
                <Icon name="Download" size={13} />
                Скачать
              </a>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
