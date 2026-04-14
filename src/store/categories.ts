import { Globe, Link, FileText, Folder, BookOpen, Clock, Settings } from "lucide-react";
import type { Category, CategoryMeta } from "@/types/types";

export const CATEGORIES: Record<Category, CategoryMeta> = {
  domain: {
    label: "Domain",
    icon: Globe,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  url: {
    label: "URL",
    icon: Link,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  content: {
    label: "Content",
    icon: FileText,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  file: {
    label: "File",
    icon: Folder,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  meta: {
    label: "Meta",
    icon: BookOpen,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  time: {
    label: "Time",
    icon: Clock,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
  },
  logic: {
    label: "Logic",
    icon: Settings,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
  },
};

export const CATEGORY_ORDER: Category[] = [
  "domain",
  "url",
  "content",
  "file",
  "time",
  "meta",
  "logic",
];
