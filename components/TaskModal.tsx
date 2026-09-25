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
  Plus,
} from 'lucide-react';
import type { NewTaskPayload, Difficulty, Priority } from '@/lib/types';
import ChecklistInputList from './ChecklistInputList';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  loading?: boolean;
  onSubmit: (payload: NewTaskPayload) => Promise<boolean>;
  onSuccess?: () => void;
};

const initialState = {
  title: '',
  course: '',
  description: '',
  deadline: '',
  difficulty: 'medium' as Difficulty,
  priority: 'medium' as Priority,
  estimatedHours: '',
};

function emptySubscribe() {
  return () => {};
}

export default function TaskModal({
  isOpen,
  onClose,
  userId = 'damar-raditya',
  loading = false,
  onSubmit,
  onSuccess,
}: TaskModalProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [form, setForm] = useState(initialState);
  const [preparationItems, setPreparationItems] = useState<string[]>(['']);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Close on Escape & lock scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isClient || !isOpen) return null;

  const updateField = (field: keyof typeof initialState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const checklists = [
      ...preparationItems
        .filter((t) => t.trim() !== '')
        .map((title) => ({ title, type: 'preparation_item' as const })),
      ...subtasks
        .filter((t) => t.trim() !== '')
        .map((title) => ({ title, type: 'subtask' as const })),
    ];

    const payload: NewTaskPayload = {
      userId,
      title: form.title,
      course: form.course || undefined,
      description: form.description || undefined,
      currentDeadline: form.deadline,
      difficulty: form.difficulty,
      basePriority: form.priority,
      estimatedTimeMinutes: form.estimatedHours
        ? Math.round(parseFloat(form.estimatedHours) * 60)
        : 0,
      checklists,
    };

    try {
      const ok = await onSubmit(payload);
      if (ok) {
        setForm(initialState);
        setPreparationItems(['']);
        setSubtasks([]);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError('Gagal menyimpan tugas. Periksa koneksi dan coba lagi.');
      }
    } catch {
      setError('Terjadi kendala saat menghubungi server.');
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = loading || submitting;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Backdrop click handler */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => !isPending && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] rounded-xl border border-border bg-card text-card-foreground shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="task-modal-title"
                className="text-base font-semibold tracking-tight text-foreground"
              >
                Tambah Agenda Baru
              </h2>
              <p className="text-xs text-muted-foreground">
                Catat tugas perkuliahan untuk kalkulasi prioritas otomatis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
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
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                Nama Tugas <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Contoh: Makalah Sistem Terdistribusi"
                autoFocus
                required
              />
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

            {/* Catatan */}
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
                placeholder="Kebutuhan tugas, format submission, link referensi..."
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
                        "rounded py-1 text-[11px] font-medium transition-all",
                        form.difficulty === opt.value
                          ? "bg-card text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
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
                        "rounded py-1 text-[11px] font-medium transition-all",
                        form.priority === opt.value
                          ? "bg-card text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Estimasi Waktu */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                  Estimasi Pengerjaan
                </label>
                <span className="text-[10px] text-muted-foreground">opsional</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.estimatedHours}
                  onChange={(e) => updateField('estimatedHours', e.target.value)}
                  placeholder="Contoh: 2.5"
                  className="pr-12"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  jam
                </span>
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

            {/* Feedback error */}
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Sticky Modal Footer */}
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
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Simpan Agenda
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
