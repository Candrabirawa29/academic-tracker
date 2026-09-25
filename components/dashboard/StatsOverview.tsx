'use client';

import { CheckCircle2, Clock, AlertTriangle, PlayCircle } from 'lucide-react';
import type { TaskStats } from '@/lib/dashboard';
import { Card, CardContent } from '@/components/ui/card';

type Props = { stats: TaskStats };

type StatItem = {
  key: keyof TaskStats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  indicator: string; // color for subtle dot
};

const items: StatItem[] = [
  {
    key: 'inProgress',
    label: 'Sedang Dikerjakan',
    icon: PlayCircle,
    indicator: 'bg-sky-500',
  },
  {
    key: 'late',
    label: 'Terlambat',
    icon: AlertTriangle,
    indicator: 'bg-red-500',
  },
  {
    key: 'upcoming',
    label: 'Belum Mulai',
    icon: Clock,
    indicator: 'bg-slate-400 dark:bg-slate-500',
  },
  {
    key: 'completed',
    label: 'Selesai',
    icon: CheckCircle2,
    indicator: 'bg-emerald-500',
  },
];

export default function StatsOverview({ stats }: Props) {
  const total = items.reduce((acc, c) => acc + (stats[c.key] ?? 0), 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const count = stats[item.key] ?? 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <Card key={item.key} className="border-border bg-card shadow-xs transition-colors">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${item.indicator}`} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </div>
                <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {count}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                  {percentage}%
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}