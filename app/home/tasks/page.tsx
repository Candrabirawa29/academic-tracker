'use client';

import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import TaskModal from '@/components/TaskModal';
import EditTaskModal from '@/components/EditTaskModal';
import DeleteTaskDialog from '@/components/DeleteTaskDialog';
import type { Task } from '@/lib/types';
import {
  ListTodo,
  Search,
  Filter,
  Plus,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivateTasksPage() {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleChecklist } = useTasks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

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
          <div className="flex items-center gap-1.5 mb-1">
            <Link
              href="/home"
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Dashboard
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-medium text-foreground">Semua Tugas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-primary" />
            Agenda & Tugas Akademik
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola, perbarui, dan pantau seluruh agenda kuliah dan tugas mandiri kamu
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Agenda Baru
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border bg-card/60 backdrop-blur-xs">
        <CardContent className="p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan judul, matkul, atau catatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-3 text-xs font-medium text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">Semua Status</option>
                <option value="not_started">Antrian</option>
                <option value="in_progress">Berjalan</option>
                <option value="completed">Selesai</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-3 text-xs font-medium text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">Semua Kesulitan</option>
                <option value="easy">Mudah</option>
                <option value="medium">Sedang</option>
                <option value="hard">Berat</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Menampilkan {filteredTasks.length} dari {tasks.length} total agenda</span>
          {(search || statusFilter !== 'all' || difficultyFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDifficultyFilter('all');
              }}
              className="text-primary hover:underline font-medium text-[11px]"
            >
              Reset Filter
            </button>
          )}
        </div>

        <TaskList
          tasks={filteredTasks}
          onToggleChecklist={toggleChecklist}
          onEdit={(task) => setTaskToEdit(task)}
          onDelete={(task) => setTaskToDelete(task)}
          readOnly={false}
        />
      </div>

      {/* Modal Buat Tugas Baru */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createTask}
      />

      {/* Modal Edit Tugas */}
      <EditTaskModal
        isOpen={Boolean(taskToEdit)}
        task={taskToEdit}
        onClose={() => setTaskToEdit(null)}
        onUpdate={updateTask}
      />

      {/* Dialog Konfirmasi Hapus Tugas */}
      <DeleteTaskDialog
        isOpen={Boolean(taskToDelete)}
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onDelete={deleteTask}
      />
    </main>
  );
}
