'use client';

import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import {
  ListChecks,
  Search,
  Filter,
  Layers,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function PublicTasksPage() {
  const { tasks } = useTasks();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.course && t.course.toLowerCase().includes(search.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' || t.status === statusFilter;

      const matchDifficulty =
        difficultyFilter === 'all' || t.difficulty === difficultyFilter;

      return matchSearch && matchStatus && matchDifficulty;
    });
  }, [tasks, search, statusFilter, difficultyFilter]);

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-6 sm:px-8 md:py-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Portal Utama
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Direktori Agenda Akademik
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar tugas perkuliahan terdata (tampilan publik mode baca)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" variant="outline" className="h-8">
            <Link href="/login" className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Owner Login
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari tugas atau mata kuliah..."
                className="pl-9 text-xs"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-9 appearance-none rounded-md border border-input bg-card px-3 py-1.5 text-xs text-foreground outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Semua Status Pengerjaan</option>
                <option value="not_started">Belum Mulai</option>
                <option value="in_progress">Sedang Dikerjakan</option>
                <option value="completed">Selesai</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full h-9 appearance-none rounded-md border border-input bg-card px-3 py-1.5 text-xs text-foreground outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Semua Tingkat Kesulitan</option>
                <option value="easy">Mudah</option>
                <option value="medium">Sedang</option>
                <option value="hard">Berat</option>
              </select>
              <Layers className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List (Read-only) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Menampilkan <strong className="text-foreground">{filteredTasks.length}</strong> dari {tasks.length} agenda</span>
        </div>

        <TaskList
          tasks={filteredTasks}
          readOnly={true}
        />
      </div>
    </main>
  );
}
