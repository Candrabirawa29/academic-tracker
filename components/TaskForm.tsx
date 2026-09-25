'use client';

import { useState } from 'react';
import {
  Plus,
  BookOpen,
  CalendarClock,
  FileText,
  Gauge,
  Flag,
  Timer,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { NewTaskPayload, Difficulty, Priority } from '@/lib/types';
import ChecklistInputList from './ChecklistInputList';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  userId: string;
  loading: boolean;
  onSubmit: (payload: NewTaskPayload) => Promise<boolean>;
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

export default function TaskForm({ userId, loading, onSubmit }: Props) {
  const [form, setForm] = useState(initialState);
  const [preparationItems, setPreparationItems] = useState<string[]>(['']);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateField = (field: keyof typeof initialState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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

    const ok = await onSubmit(payload);
    if (ok) {
      setForm(initialState);
      setPreparationItems(['']);
      setSubtasks([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } else {
      setError('Gagal menyimpan tugas. Periksa koneksi dan coba lagi.');
    }
  };

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Tambah Agenda Baru</CardTitle>
            <CardDescription className="text-xs">
              Catat tugas akademik untuk kalkulasi prioritas otomatis
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
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
        <div className="grid grid-cols-2 gap-3">
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

        {/* Feedback messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Agenda berhasil disimpan!</span>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-10 font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Simpan Agenda
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}