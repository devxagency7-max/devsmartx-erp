import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/shared/components/ui/card';
import { SectionHeader } from '@/shared/components/ui/section-header';
import { Badge } from '@/shared/components/ui/badge';

type StatusLevel = 'operational' | 'degraded' | 'outage';

export interface StatusItem {
  label: string;
  status: StatusLevel;
}

interface SystemStatusWidgetProps {
  items?: StatusItem[];
}

const defaultItems: StatusItem[] = [
  { label: 'Authentication', status: 'operational' },
  { label: 'Database', status: 'operational' },
  { label: 'Storage', status: 'operational' },
];

export function SystemStatusWidget({ items = defaultItems }: SystemStatusWidgetProps) {
  const { t } = useTranslation();

  const statusConfig: Record<StatusLevel, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
    operational: { label: t('dashboard.operational'), variant: 'success' },
    degraded: { label: t('dashboard.degraded'), variant: 'warning' },
    outage: { label: t('dashboard.outage'), variant: 'destructive' },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <SectionHeader title={t('dashboard.systemStatus')} className="pb-3" />
        <ul className="space-y-2">
          {items.map((item) => {
            const config = statusConfig[item.status];
            return (
              <li key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--foreground))]">{item.label}</span>
                <Badge variant={config.variant}>{config.label}</Badge>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
