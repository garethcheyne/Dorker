export interface DorkOperator {
  keyword: string;
  description: string;
  example: string;
  category: Category;
  placeholder: string;
}

export interface DorkTemplate {
  name: string;
  query: string;
  description: string;
}

export type Category =
  | "domain"
  | "url"
  | "content"
  | "file"
  | "meta"
  | "time"
  | "logic";

export interface CategoryMeta {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}
