import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/components/ui/badge';

interface Props {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

export function ComingSoonPage({ icon: Icon, titleKey, descKey }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="rounded-2xl bg-[hsl(var(--muted))] p-6">
        <Icon size={40} className="text-[hsl(var(--muted-foreground))]" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">{t(titleKey)}</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm">{t(descKey)}</p>
      </div>
      <Badge variant="secondary">{t('nav.comingSoon')}</Badge>
    </div>
  );
}
