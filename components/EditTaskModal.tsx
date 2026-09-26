'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  BookOpen,
  CalendarClock,
  FileText,
  Gauge,
  Flag,
  Timer,
  Loader2,
  AlertCircle,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import type { Task, UpdateTaskPayload, Difficulty, Priority, TaskStatus } from '@/lib/types';
import ChecklistInputList from './ChecklistInputList';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EditTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: (taskId: string, payload: UpdateTaskPayload) => Promise<boolean>;
};

function emptySubscribe() {
  return () => {};
}

function formatForDateTimeInput(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onUpdate,
}: EditTaskModalProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [form, setForm] = useState({
    title: '',
    course: '',
    description: '',
    deadline: '',
    status: 'not_started' as TaskStatus,
    difficulty: 'medium' as Difficulty,
    priority: 'medium' as Priority,
    estimatedHours: '',
    progressPercent: 0,
  });

  const [preparationItems, setPreparationItems] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Pre-fill data ketika task berubah atau modal dibuka
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        course: task.course || '',
        description: task.description || '',
        deadline: formatForDateTimeInput(task.currentDeadline),
        status: (task.status as TaskStatus) || 'not_started',
        difficulty: (task.difficulty as Difficulty) || 'medium',
        priority: (task.basePriority as Priority) || 'medium',
        estimatedHours: task.estimatedTimeMinutes ? (task.estimatedTimeMinutes / 60).toString() : '',
        progressPercent: task.progressPercent ?? 0,
      });

      const prep = task.checklists
        ?.filter((c) => c.type === 'preparation_item')
        .map((c) => c.title) || [];
      const subs = task.checklists
        ?.filter((c) => c.type === 'subtask')
        .map((c) => c.title) || [];

      setPreparationItems(prep.length > 0 ? prep : ['']);
      setSubtasks(subs.length > 0 ? subs : []);
      setError(null);
    }
  }, [task, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isClient || !isOpen || !task) return null;

  const updateField = (field: string, val: unknown) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Nama tugas wajib diisi.');
      return;
    }
    if (!form.deadline) {
      setError('Tenggat waktu wajib diisi.');
      return;
    }

    const deadlineDate = new Date(form.deadline);
    if (isNaN(deadlineDate.getTime())) {
      setError('Format tanggal deadline tidak valid.');
      return;
    }

    const estimatedTimeMinutes = form.estimatedHours
      ? Math.round(parseFloat(form.estimatedHours) * 60)
      : task.estimatedTimeMinutes;

    const allChecklists = [
      ...preparationItems
        .filter((i) => i.trim().length > 0)
        .map((title) => {
          const original = task.checklists?.find((c) => c.title === title && c.type === 'preparation_item');
          return {
            title: title.trim(),
            type: 'preparation_item' as const,
            isChecked: original ? original.isChecked : false,
          };
        }),
      ...subtasks
        .filter((i) => i.trim().length > 0)
        .map((title) => {
          const original = task.checklists?.find((c) => c.title === title && c.type === 'subtask');
          return {
            title: title.trim(),
            type: 'subtask' as const,
            isChecked: original ? original.isChecked : false,
          };
        }),
    ];

    const payload: UpdateTaskPayload = {
      title: form.title.trim(),
      course: form.course.trim() || null,
      description: form.description.trim() || null,
      currentDeadline: deadlineDate.toISOString(),
      status: form.status,
      difficulty: form.difficulty,
      basePriority: form.priority,
      estimatedTimeMinutes,
      progressPercent: form.status === 'completed' ? 100 : form.progressPercent,
      checklists: allChecklists,
    };

    setIsPending(true);
    try {
      const ok = await onUpdate(task.id, payload);
      if (ok) {
        onClose();
      }
    } finally {
      setIsPending(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isPending) onClose();
        }}
      />

      <div className="relative w-full max-w-xl rounded-xl border border-border bg-card shadow-lg flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Edit Agenda Tugas
              </h2>
              <p className="text-xs text-muted-foreground">
                Perbarui rincian, tenggat waktu, atau status tugas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Nama Tugas */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Nama Tugas <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Nama tugas akademik"
                required
              />
            </div>

            {/* Status Pengerjaan */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                Status Tugas
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-md border border-input bg-muted/50 p-1">
                {[
                  { value: 'not_started', label: 'Antrian' },
                  { value: 'in_progress', label: 'Berjalan' },
                  { value: 'completed', label: 'Selesai' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('status', opt.value)}
                    className={cn(
                      'rounded py-1.5 text-xs font-medium transition-all',
                      form.status === opt.value
                        ? 'bg-card text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mata Kuliah */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Mata Kuliah
                </label>
                <span className="text-[10px] text-muted-foreground">opsional</span>
              </div>
              <Input
                value={form.course}
                onChange={(e) => updateField('course', e.target.value)}
                placeholder="Contoh: Basis Data Lanjut"
              />
            </div>

            {/* Catatan / Instruksi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  Catatan / Instruksi
                </label>
                <span className="text-[10px] text-muted-foreground">opsional</span>
              </div>
              <Textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={2}
                placeholder="Kebutuhan tugas, format submission..."
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                Tenggat Waktu (Deadline) <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => updateField('deadline', e.target.value)}
                required
              />
            </div>

            {/* Kesulitan & Prioritas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                  Kesulitan
                </label>
                <div className="grid grid-cols-3 gap-1 rounded-md border border-input bg-muted/50 p-1">
                  {[
                    { value: 'easy', label: 'Mudah' },
                    { value: 'medium', label: 'Sedang' },
                    { value: 'hard', label: 'Berat' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('difficulty', opt.value)}
                      className={cn(
                        'rounded py-1 text-[11px] font-medium transition-all',
                        form.difficulty === opt.value
                          ? 'bg-card text-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                  Prioritas
                </label>
                <div className="grid grid-cols-3 gap-1 rounded-md border border-input bg-muted/50 p-1">
                  {[
                    { value: 'low', label: 'Rendah' },
                    { value: 'medium', label: 'Sedang' },
                    { value: 'high', label: 'Tinggi' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('priority', opt.value)}
                      className={cn(
                        'rounded py-1 text-[11px] font-medium transition-all',
                        form.priority === opt.value
                          ? 'bg-card text-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Estimasi Waktu & Progress Percent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                  Estimasi Pengerjaan
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={form.estimatedHours}
                    onChange={(e) => updateField('estimatedHours', e.target.value)}
                    placeholder="Contoh: 2"
                    className="pr-12 text-xs"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    jam
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Progress Pengerjaan
                  </label>
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {form.status === 'completed' ? 100 : form.progressPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={form.status === 'completed' ? 100 : form.progressPercent}
                  disabled={form.status === 'completed'}
                  onChange={(e) => updateField('progressPercent', parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Checklists */}
            <ChecklistInputList
              label="Barang / Berkas Wajib Dibawa"
              placeholder="Contoh: Print out modul, flashdisk"
              items={preparationItems}
              onChange={setPreparationItems}
            />

            <ChecklistInputList
              label="Sub-langkah Pengerjaan"
              placeholder="Contoh: Riset literatur, bab 1"
              items={subtasks}
              onChange={setSubtasks}
            />

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-border bg-card px-5 py-3.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="h-9 px-4 text-xs"
            >
              Batal
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-9 px-5 text-xs font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
