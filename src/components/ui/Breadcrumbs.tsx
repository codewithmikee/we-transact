import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex text-sm text-slate-500 gap-2 items-center">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.isCurrent ? (
            <span className="text-slate-900 font-medium">{item.label}</span>
          ) : (
            <a href={item.href || "#"} className="hover:text-indigo-600 transition-colors">
              {item.label}
            </a>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="w-4 h-4 text-slate-300" />
          )}
        </div>
      ))}
    </nav>
  );
}
