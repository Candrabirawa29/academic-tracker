'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  type TooltipProps,
  TooltipContentProps,
} from 'recharts';
import { useMemo, useState } from 'react';
import type { WorkloadPoint } from '@/lib/dashboard';

type Props = { data: WorkloadPoint[] };

// ── Custom tooltip: financial-dashboard style ─────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null;

  const value = payload[0].value as number;

  return (
    <div className="pointer-events-none min-w-[140px] rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 shadow-2xl shadow-slate-900/40 backdrop-blur-xl">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </p>
      </div>
      <p className="bg-gradient-to-r from-cyan-200 to-blue-300 bg-clip-text text-2xl font-bold leading-none text-transparent">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium text-slate-500">
        {value === 1 ? 'tugas' : 'tugas'} terjadwal
      </p>
    </div>
  );
}

// ── Custom active dot: glowing ring ───────────────────────────────
function GlowDot(props: any) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill="#22d3ee" opacity={0.15} />
      <circle cx={cx} cy={cy} r={7} fill="#22d3ee" opacity={0.25} />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#0f172a"
        stroke="#67e8f9"
        strokeWidth={2.5}
      />
    </g>
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
  const max = useMemo(
    () => Math.max(...data.map((d) => d.count), 1),
    [data]
  );
  const peakIndex = useMemo(
    () => data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0),
    [data]
  );

  const activePoint = activeIndex != null ? data[activeIndex] : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-slate-900/50 transition-all duration-500 hover:border-slate-700/80">
      {/* Ambient gradient glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/20 blur-[80px] transition-opacity duration-700 group-hover:opacity-100 opacity-60" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-[80px] transition-opacity duration-700 group-hover:opacity-100 opacity-60" />

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Header */}
      <div className="relative mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-sm shadow-lg shadow-cyan-500/30">
              📅
            </span>
            <h3 className="text-base font-bold text-white">
              Beban Tugas
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            7 hari ke depan
          </p>
        </div>

        {/* Live stat — updates on hover */}
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {activePoint ? activePoint.label : 'Total'}
          </p>
          <p className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-3xl font-bold leading-tight text-transparent tabular-nums">
            {activePoint ? activePoint.count : total}
          </p>
          <p className="text-[10px] font-medium text-slate-500">
            {activePoint ? 'tugas' : `rata-rata ${avg.toFixed(1)}/hari`}
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: -24, bottom: 0 }}
          onMouseMove={(s: any) =>
            setActiveIndex(s?.activeTooltipIndex ?? null)
          }
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
              <stop offset="45%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 6"
            vertical={false}
            stroke="#1e293b"
          />

          <XAxis
            dataKey="label"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontWeight: 500 }}
            dy={8}
          />

          <YAxis
            allowDecimals={false}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#475569' }}
            domain={[0, Math.ceil(max * 1.35)]}
            width={36}
          />

          {/* Average reference line */}
          <ReferenceLine
            y={avg}
            stroke="#475569"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
            label={{
              value: 'avg',
              position: 'insideTopRight',
              fill: '#64748b',
              fontSize: 10,
            }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: '#38bdf8',
              strokeWidth: 1,
              strokeDasharray: '4 4',
              strokeOpacity: 0.5,
            }}
            animationDuration={150}
          />

          <Area
            type="monotone"
            dataKey="count"
            stroke="url(#lineStroke)"
            strokeWidth={2.5}
            fill="url(#areaFill)"
            filter="url(#lineGlow)"
            activeDot={<GlowDot />}
            dot={false}
            animationDuration={1400}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Footer stats */}
      <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Total
          </p>
          <p className="mt-0.5 text-lg font-bold text-white tabular-nums">
            {total}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Rata-rata
          </p>
          <p className="mt-0.5 text-lg font-bold text-white tabular-nums">
            {avg.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Puncak
          </p>
          <p className="mt-0.5 text-lg font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent tabular-nums">
            {data[peakIndex]?.count ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}