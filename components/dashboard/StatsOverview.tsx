'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import type { TaskStats } from '@/lib/dashboard';

type Props = { stats: TaskStats };

type CardConfig = {
  key: keyof TaskStats;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;       // gradient for icon badge & progress bar
  text: string;           // gradient for the number
  glow: string;           // hover glow shadow
  border: string;         // hover border color
  blob: string;           // ambient blob gradient
  chip: string;           // percent chip accent
};

const cards: CardConfig[] = [
  {
    key: 'completed',
    label: 'Selesai',
    sublabel: 'tuntas',
    icon: CheckCircle2,
    gradient: 'from-emerald-400 to-green-600',
    text: 'from-emerald-300 to-green-400',
    glow: 'hover:shadow-emerald-500/20',
    border: 'hover:border-emerald-500/40',
    blob: 'from-emerald-400 to-green-600',
    chip: 'border-emerald-500/30 text-emerald-300',
  },
  {
    key: 'inProgress',
    label: 'Dikerjakan',
    sublabel: 'aktif',
    icon: Loader2,
    gradient: 'from-cyan-400 to-blue-600',
    text: 'from-cyan-300 to-blue-400',
    glow: 'hover:shadow-cyan-500/20',
    border: 'hover:border-cyan-500/40',
    blob: 'from-cyan-400 to-blue-600',
    chip: 'border-cyan-500/30 text-cyan-300',
  },
  {
    key: 'late',
    label: 'Terlambat',
    sublabel: 'perlu aksi',
    icon: AlertTriangle,
    gradient: 'from-rose-400 to-red-600',
    text: 'from-rose-300 to-red-400',
    glow: 'hover:shadow-rose-500/20',
    border: 'hover:border-rose-500/40',
    blob: 'from-rose-400 to-red-600',
    chip: 'border-rose-500/30 text-rose-300',
  },
  {
    key: 'upcoming',
    label: 'Belum Mulai',
    sublabel: 'antrian',
    icon: Clock,
    gradient: 'from-slate-400 to-slate-600',
    text: 'from-slate-200 to-slate-400',
    glow: 'hover:shadow-slate-500/20',
    border: 'hover:border-slate-500/40',
    blob: 'from-slate-400 to-slate-600',
    chip: 'border-slate-500/30 text-slate-300',
  },
];

// ── Animated count-up number ──────────────────────────────────────
function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.9,
      ease: 'easeOut',
    });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, mv, rounded]);

  return <span className="tabular-nums">{display}</span>;
}

export default function StatsOverview({ stats }: Props) {
  const total = cards.reduce((acc, c) => acc + (stats[c.key] ?? 0), 0);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const value = stats[card.key] ?? 0;
        const pct = total > 0 ? (value / total) * 100 : 0;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: i * 0.08,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -4 }}
            className={`group relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 shadow-lg shadow-slate-900/40 transition-all duration-500 hover:shadow-xl ${card.glow} ${card.border}`}
          >
            {/* Ambient gradient blob (top-right) */}
            <div
              className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${card.blob} opacity-[0.15] blur-2xl transition-opacity duration-500 group-hover:opacity-[0.35]`}
            />

            {/* Subtle grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Icon badge + percent chip */}
            <div className="relative mb-3 flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg shadow-black/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[6deg]`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>

              <span
                className={`rounded-full border bg-slate-950/50 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm tabular-nums ${card.chip}`}
              >
                {pct.toFixed(0)}%
              </span>
            </div>

            {/* Value */}
            <p
              className={`relative bg-gradient-to-br ${card.text} bg-clip-text text-3xl font-bold leading-none text-transparent`}
            >
              <CountUp value={value} />
            </p>

            {/* Labels */}
            <div className="relative mt-1.5 flex items-baseline gap-1.5">
              <p className="text-sm font-semibold text-white">{card.label}</p>
              <p className="text-[11px] text-slate-500">· {card.sublabel}</p>
            </div>

            {/* Progress bar */}
            <div className="relative mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-800/80">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  delay: 0.4 + i * 0.08,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`h-full rounded-full bg-gradient-to-r ${card.gradient} shadow-sm`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}