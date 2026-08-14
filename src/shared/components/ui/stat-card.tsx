import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from './card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

const trendColors = {
  up: 'text-[hsl(var(--success))]',
  down: 'text-[hsl(var(--destructive))]',
  neutral: 'text-[hsl(var(--muted-foreground))]',
} as const;

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              {label}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
              {value}
            </p>
            {trend && (
              <p className={cn('text-xs font-medium', trendColors[trend.direction])}>
                {trend.value}
              </p>
            )}
          </div>
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10">
              <Icon size={20} className="text-[hsl(var(--primary))]" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
