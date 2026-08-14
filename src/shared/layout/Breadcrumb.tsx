import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight size={14} className="text-[hsl(var(--muted-foreground))]" />
          )}
          <span
            className={
              index === items.length - 1
                ? 'text-[hsl(var(--foreground))] font-medium'
                : 'text-[hsl(var(--muted-foreground))]'
            }
          >
            {item.label}
          </span>
        </span>
      ))}
    </nav>
  );
}
