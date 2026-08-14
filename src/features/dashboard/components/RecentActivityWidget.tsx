import { useTranslation } from 'react-i18next';
import { ClockIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { SectionHeader } from '@/shared/components/ui/section-header';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';

export interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
}

interface RecentActivityWidgetProps {
  items?: ActivityItem[];
  isLoading?: boolean;
}

export function RecentActivityWidget({ items = [], isLoading = false }: RecentActivityWidgetProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="pt-6">
        <SectionHeader title={t('dashboard.recentActivity')} className="pb-3" />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={ClockIcon}
            title={t('dashboard.noActivity')}
            description={t('dashboard.activityWillAppear')}
            className="py-8"
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-md px-2 py-1.5 text-sm hover:bg-[hsl(var(--muted))]"
              >
                <span className="text-[hsl(var(--foreground))]">{item.description}</span>
                <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                  {item.timestamp}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
