'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useMemo, useState } from 'react';
import type { WorkloadPoint } from '@/lib/dashboard';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Props = { data: WorkloadPoint[] };

type TooltipPayloadItem = {
  value: number;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  const value = payload[0].value;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-bold text-foreground">
        {value} <span className="text-xs font-normal text-muted-foreground">tugas terjadwal</span>
      </p>
    </div>
  );
}

export default function WorkloadChart({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = useMemo(
    () => data.reduce((acc, d) => acc + d.count, 0),
    [data]
  );
  const avg = useMemo(
    () => (data.length ? total / data.length : 0),
    [total, data.length]
  );

  const activePoint = activeIndex != null ? data[activeIndex] : null;

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Distribusi Beban Kerja</CardTitle>
              <CardDescription className="text-xs">
                Perkiraan beban tugas selama 7 hari ke depan
              </CardDescription>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-medium text-muted-foreground">
              {activePoint
                ? `${activePoint.label}: ${activePoint.count} tugas`
                : `Total ${total} tugas · Rata-rata ${avg.toFixed(1)}/hari`}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
            onMouseMove={(state) => {
              const idx = (state as { activeTooltipIndex?: number | null } | null)?.activeTooltipIndex;
              if (typeof idx === 'number') {
                setActiveIndex(idx);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.2} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-border"
            />

            <XAxis
              dataKey="label"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
              dy={6}
            />

            <YAxis
              allowDecimals={false}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#areaFill)"
              className="text-primary"
              activeDot={{ r: 4, strokeWidth: 2, className: "stroke-primary fill-background" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}