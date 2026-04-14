import type { Category } from "@/shared/types";
import { CATEGORIES } from "@/shared/categories";

interface Props {
  category: Category;
  active?: boolean;
  onClick?: () => void;
}

export function CategoryBadge({ category, active, onClick }: Props) {
  const meta = CATEGORIES[category];
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium
        transition-all duration-100 cursor-pointer whitespace-nowrap
        ${active
          ? "bg-primary/10 text-primary ring-1 ring-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }
      `}
    >
      <span className="text-[11px] leading-none">{meta.icon}</span>
      {meta.label}
    </button>
  );
}
