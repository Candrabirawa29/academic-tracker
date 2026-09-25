'use client';

import { useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import StatsOverview from '@/components/dashboard/StatsOverview';
import WorkloadChart from '@/components/dashboard/WorkloadChart';
import FocusNowCard from '@/components/dashboard/FocusNowCard';
import TomorrowChecklist from '@/components/dashboard/TomorrowChecklist';
import {
  computeStats,
  computeWorkload,
  getFocusTask,
  getTomorrowChecklist,
} from '@/lib/dashboard';
import {
  CalendarDays,
  ListChecks,
  Clock,
  Lock,
  ArrowRight,
  ExternalLink,
  Flame,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';

function getGreeting(hour: number) {
  if (hour < 4) return 'Selamat malam';
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

export default function PublicHomePage() {
  const { tasks } = useTasks();

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const workload = useMemo(() => computeWorkload(tasks), [tasks]);
  const focusTask = useMemo(() => getFocusTask(tasks), [tasks]);
  const tomorrowItems = useMemo(() => getTomorrowChecklist(tasks), [tasks]);

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const today = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const activeCount = (stats.inProgress ?? 0) + (stats.upcoming ?? 0);

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-6 sm:px-8 md:py-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs">
            AO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {greeting}
              </h1>
              <Badge variant="outline" className="text-[11px] font-normal">
                Portal Publik (Read-only)
              </Badge>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {today} · {activeCount} agenda aktif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="h-8">
            <Link href="/tasks">
              <ListChecks className="h-3.5 w-3.5 mr-1" /> Direktori Agenda
            </Link>
          </Button>

          <Button asChild size="sm" className="h-8">
            <Link href="/login">
              <Lock className="h-3.5 w-3.5 mr-1" /> Owner Login
            </Link>
          </Button>
        </div>
      </header>

      {/* ── 1. Priority Focus Now ─────────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Fokus Akademik Terkini</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Tugas prioritas tertinggi saat ini
          </span>
        </div>
        <FocusNowCard task={focusTask} readOnly={true} />
      </section>

      {/* ── 2. Metric Overview ─────────────────────────────────── */}
      <section className="space-y-2">
        <StatsOverview stats={stats} />
      </section>

      {/* ── 3. Main Two-Column Layout ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (7 cols): Tasks & Workload */}
        <div className="space-y-6 lg:col-span-7">
          {/* Active Tasks Section */}
          <section id="tasks" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">
                  Agenda Akademik Terjadwal
                </h2>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                  {tasks.length} total
                </Badge>
              </div>

              <Link
                href="/tasks"
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Buka direktori lengkap</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <TaskList tasks={tasks} readOnly={true} />
          </section>

          {/* Workload Distribution */}
          <section className="space-y-2">
            <WorkloadChart data={workload} />
          </section>
        </div>

        {/* Right Column (5 cols): Tomorrow Checklist & About */}
        <div className="space-y-6 lg:col-span-5">
          {/* Tomorrow Preparation Items */}
          <section>
            <TomorrowChecklist items={tomorrowItems} readOnly={true} />
          </section>

          {/* About / Info Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-xs font-semibold">Tentang Academic OS</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                Ini adalah portal status akademik publik yang terintegrasi langsung dengan database pribadi dan asisten WhatsApp otomatis.
              </p>
              <p>
                Pengunjung dapat memantau estimasi tenggat waktu dan progres tugas secara transparan. Mode pengeditan dan penambahan agenda terkunci khusus untuk pemilik.
              </p>
              <div className="pt-2 border-t border-border">
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  Masuk sebagai Pengelola <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row">
        <p>Academic OS · Public Transparency Portal</p>
        <p className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> Sinkronisasi data otomatis
        </p>
      </footer>
    </main>
  );
}