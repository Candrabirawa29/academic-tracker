'use client';

import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import TaskModal from '@/components/TaskModal';
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
  ListTodo,
  Plus,
  ArrowRight,
  Flame,
  Kanban,
  BarChart3,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

function getGreeting(hour: number) {
  if (hour < 4) return 'Selamat malam';
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

export default function PrivateDashboardPage() {
  const { tasks, loading, createTask, toggleChecklist } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      {/* ── Top Header ────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {greeting}, Owner
            </h1>
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-[11px] font-medium">
                {activeCount} tugas aktif
              </Badge>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {today}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8">
            <Link href="/home/tasks">
              <ListTodo className="h-3.5 w-3.5 mr-1" />
              Direktori Tugas
            </Link>
          </Button>

          <Button onClick={() => setIsModalOpen(true)} size="sm" className="h-8">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Tambah Tugas
          </Button>
        </div>
      </header>

      {/* ── 1. PRIMARY PRIORITY: FOCUS NOW ────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Prioritas Kerja Sekarang</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Kalkulasi otomatis berdasarkan urgensi & bobot
          </span>
        </div>
        <FocusNowCard
          task={focusTask}
          onToggleChecklist={toggleChecklist}
          readOnly={false}
        />
      </section>

      {/* ── 2. METRIC OVERVIEW: WHAT DO I HAVE LEFT? ───────────── */}
      <section className="space-y-2">
        <StatsOverview stats={stats} />
      </section>

      {/* ── 3. MAIN WORKSPACE: TWO COLUMNS ─────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (7 cols): Tasks & Workload */}
        <div className="space-y-6 lg:col-span-7">
          {/* Active Tasks List */}
          <section id="tasks" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">
                  Daftar Tugas Aktif
                </h2>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                  {tasks.length} total
                </Badge>
              </div>

              <Link
                href="/home/tasks"
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Lihat semua</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <TaskList
              tasks={tasks}
              onToggleChecklist={toggleChecklist}
              readOnly={false}
            />
          </section>

          {/* Workload Distribution */}
          <section className="space-y-2">
            <WorkloadChart data={workload} />
          </section>
        </div>

        {/* Right Column (5 cols): Tomorrow Checklist, Form, Quick Actions */}
        <div className="space-y-6 lg:col-span-5">
          {/* Tomorrow Preparation Items */}
          <section>
            <TomorrowChecklist
              items={tomorrowItems}
              onToggle={toggleChecklist}
              readOnly={false}
            />
          </section>

          {/* Quick Actions Panel */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-xs font-semibold">Menu Cepat</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              <Link
                href="/home/tasks"
                className="flex items-center justify-between rounded-md p-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ListTodo className="h-3.5 w-3.5" />
                  <span>Daftar Semua Tugas</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {tasks.length}
                </Badge>
              </Link>

              <div className="flex items-center justify-between rounded-md p-2 text-xs font-medium text-muted-foreground/60">
                <div className="flex items-center gap-2">
                  <Kanban className="h-3.5 w-3.5" />
                  <span>Kanban Board</span>
                </div>
                <Badge variant="secondary" className="text-[9px] font-normal">
                  Phase 3
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-md p-2 text-xs font-medium text-muted-foreground/60">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Progres & Statistik</span>
                </div>
                <Badge variant="secondary" className="text-[9px] font-normal">
                  Phase 3
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Action: Tambah Tugas Baru */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Aksi Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full h-9 justify-start text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Tambah Agenda Baru
              </Button>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Buka formulir modal untuk mencatat agenda atau persiapan akademik secara instan.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loading={loading}
        onSubmit={createTask}
      />

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row">
        <p>Academic OS — Personal Productivity Suite</p>
        <p className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> Sinkronisasi data real-time aktif
        </p>
      </footer>
    </main>
  );
}
