import { useState } from "react";
import Icon from "@/components/ui/icon";

interface FileItem {
  id: number;
  name: string;
  description: string;
  size: string;
  type: string;
  downloads: number;
  date: string;
  category: string;
}

const initialFiles: FileItem[] = [
  {
    id: 1,
    name: "Презентация компании 2024",
    description: "Обзор деятельности, ключевые показатели и стратегия",
    size: "4.2 МБ",
    type: "PDF",
    downloads: 284,
    date: "15 мар 2025",
    category: "Документы",
  },
  {
    id: 2,
    name: "Коммерческое предложение",
    description: "Актуальные тарифы и условия сотрудничества",
    size: "1.8 МБ",
    type: "DOCX",
    downloads: 197,
    date: "10 мар 2025",
    category: "Документы",
  },
  {
    id: 3,
    name: "Инструкция по установке",
    description: "Пошаговое руководство для начала работы",
    size: "856 КБ",
    type: "PDF",
    downloads: 431,
    date: "05 мар 2025",
    category: "Руководства",
  },
  {
    id: 4,
    name: "Шаблон договора",
    description: "Стандартный договор оказания услуг",
    size: "245 КБ",
    type: "DOCX",
    downloads: 162,
    date: "01 мар 2025",
    category: "Шаблоны",
  },
  {
    id: 5,
    name: "Медиакит 2025",
    description: "Логотипы, баннеры и фирменные материалы",
    size: "12.5 МБ",
    type: "ZIP",
    downloads: 89,
    date: "20 фев 2025",
    category: "Дизайн",
  },
  {
    id: 6,
    name: "Отчёт за Q4 2024",
    description: "Финансовые результаты четвёртого квартала",
    size: "3.1 МБ",
    type: "XLSX",
    downloads: 318,
    date: "15 фев 2025",
    category: "Отчёты",
  },
];

const typeColors: Record<string, string> = {
  PDF: "bg-red-50 text-red-600",
  DOCX: "bg-blue-50 text-blue-600",
  XLSX: "bg-green-50 text-green-600",
  ZIP: "bg-amber-50 text-amber-600",
};

const categories = ["Все", "Документы", "Руководства", "Шаблоны", "Дизайн", "Отчёты"];

export default function Index() {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [sortBy, setSortBy] = useState<"date" | "downloads" | "name">("downloads");
  const [search, setSearch] = useState("");

  const handleDownload = (id: number) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, downloads: f.downloads + 1 } : f))
    );
  };

  const filtered = files
    .filter((f) => activeCategory === "Все" || f.category === activeCategory)
    .filter(
      (f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "downloads") return b.downloads - a.downloads;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const topFile = [...files].sort((a, b) => b.downloads - a.downloads)[0];
  const totalDownloads = files.reduce((sum, f) => sum + f.downloads, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Загрузки
              </h1>
              <p className="mt-1 text-muted-foreground text-sm">
                Файлы и материалы для скачивания
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-foreground">
                {totalDownloads.toLocaleString("ru")}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                всего скачиваний
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-border rounded-sm p-5">
            <div className="text-xs text-muted-foreground mb-1">Файлов</div>
            <div className="text-xl font-semibold">{files.length}</div>
          </div>
          <div className="border border-border rounded-sm p-5">
            <div className="text-xs text-muted-foreground mb-1">Популярный</div>
            <div className="text-sm font-medium truncate">{topFile?.name}</div>
          </div>
          <div className="border border-border rounded-sm p-5">
            <div className="text-xs text-muted-foreground mb-1">Топ скачиваний</div>
            <div className="text-xl font-semibold">{topFile?.downloads}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Поиск по файлам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-border rounded-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${
                    activeCategory === cat
                      ? "bg-foreground text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Сортировка:</span>
              {(["downloads", "date", "name"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2 py-1 rounded-sm transition-colors ${
                    sortBy === s
                      ? "text-foreground font-medium"
                      : "hover:text-foreground"
                  }`}
                >
                  {s === "downloads" ? "популярные" : s === "date" ? "новые" : "А–Я"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* File list */}
        <div className="divide-y divide-border border-t border-b border-border">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">
              Ничего не найдено
            </div>
          )}
          {filtered.map((file, index) => {
            const isTop =
              sortBy === "downloads" &&
              index === 0 &&
              activeCategory === "Все" &&
              !search;
            return (
              <div
                key={file.id}
                className="group flex items-center gap-5 py-5 hover:bg-accent/40 transition-colors -mx-2 px-2 rounded-sm"
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center text-xs font-semibold ${
                    typeColors[file.type] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {file.type}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-sm leading-snug">
                      {file.name}
                    </span>
                    {isTop && (
                      <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-sm font-medium flex-shrink-0">
                        ТОП
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {file.description}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground flex-shrink-0">
                  <span>{file.size}</span>
                  <span>{file.date}</span>
                  <div className="flex items-center gap-1 w-14 justify-end">
                    <Icon name="Download" size={12} />
                    <span>{file.downloads.toLocaleString("ru")}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(file.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-sm text-foreground hover:bg-foreground hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                >
                  <Icon name="Download" size={13} />
                  Скачать
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filtered.length}{" "}
            {filtered.length === 1
              ? "файл"
              : filtered.length < 5
              ? "файла"
              : "файлов"}
          </span>
          <span>Обновлено 25 марта 2025</span>
        </div>
      </main>
    </div>
  );
}
