import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface ReviewRow {
  label: string;
  value: ReactNode;
}

interface ReviewCardProps {
  title: string;
  rows: ReviewRow[];
}

export function ReviewCard({ title, rows }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
              <dt className="text-[hsl(var(--muted-foreground))] shrink-0">{row.label}</dt>
              <dd className="font-medium text-right break-words max-w-[60%]">
                {row.value ?? '—'}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
