'use client';

import { useMemo, useState } from 'react';
import type { Task } from '@/lib/types';
import {
  Clock,
  CheckCircle2,
  BookOpen,
  Target,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import ChecklistItem from '@/components/ChecklistItem';
import TaskDetailModal from '@/components/TaskDetailModal';

type Props = {
  task: Task | null;
  onToggleChecklist?: (id: string, isChecked: boolean) => void;
  readOnly?: boolean;
};

export default function FocusNowCard({ task, onToggleChecklist, readOnly = false }: Props) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Derive explicit reason why it needs attention now (called unconditionally for rules-of-hooks)
  const reason = useMemo(() => {
    if (!task) return '';
    const deadline = new Date(task.currentDeadline);
    const now = new Date();
    const msLeft = deadline.getTime() - now.getTime();
    const hoursLeft = Math.round(msLeft / 3600000);
    const daysLeft = Math.ceil(msLeft / 86400000);
    const isPast = msLeft < 0;

    const reasons: string[] = [];
    if (isPast) {
      reasons.push('Melewati tenggat waktu');
    } else if (hoursLeft <= 6) {
      reasons.push(`Sisa ${Math.max(1, hoursLeft)} jam`);
    } else if (hoursLeft <= 24) {
      reasons.push('Tenggat hari ini');
    } else if (daysLeft <= 2) {
      reasons.push('Tenggat besok');
    }

    const prepIncomplete = task.checklists?.some(
      (c) => c.type === 'preparation_item' && !c.isChecked
    );
    if (prepIncomplete) {
      reasons.push('Persiapan fisik belum lengkap');
    }

    const progress = task.progressPercent ?? 0;
    if (progress < 50) {
      reasons.push(`${100 - progress}% pekerjaan tersisa`);
    }

    if (task.basePriority === 'high') {
      reasons.push('Prioritas tinggi');
    }

    return reasons.length > 0 ? reasons.join(' · ') : 'Tugas prioritas antrian utama';
  }, [task]);

  // Empty state
  if (!task) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Tidak Ada Tugas Mendesak</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Semua tugas berstatus selesai atau belum ada agenda prioritas aktif.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const deadline = new Date(task.currentDeadline);
  const now = new Date();
  const msLeft = deadline.getTime() - now.getTime();
  const hoursLeft = Math.round(msLeft / 3600000);
  const daysLeft = Math.ceil(msLeft / 86400000);
  const isPast = msLeft < 0;

  const preparationItems = task.checklists?.filter(
    (c) => c.type === 'preparation_item'
  ) ?? [];

  const subtasks = task.checklists?.filter(
    (c) => c.type === 'subtask'
  ) ?? [];

  return (
    <>
      <Card className="border-border bg-card shadow-xs transition-colors">
        <CardContent className="p-5 sm:p-6 space-y-4">
          {/* Top Header: Badge & Attention reason */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Target className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-semibold text-foreground tracking-tight">
                Fokus Utama Saat Ini
              </span>
              <Badge
                variant={isPast ? 'destructive' : hoursLeft <= 24 ? 'warning' : 'info'}
                className="text-[10px]"
              >
                {isPast ? 'Overdue' : hoursLeft <= 24 ? 'Mendesak' : 'Aktif'}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Alasan: <strong className="text-foreground font-semibold">{reason}</strong></span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailOpen(true)}
                className="h-7 px-2.5 text-xs font-medium gap-1 text-foreground hover:bg-accent border-border"
              >
                <Eye className="h-3.5 w-3.5 text-primary" />
                <span>Lihat Detail</span>
              </Button>
            </div>
          </div>

          {/* Task Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {task.course && (
                <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  {task.course}
                </span>
              )}
              <Badge variant="outline" className="text-[10px] font-normal">
                Prioritas {task.basePriority}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-normal">
                Kesulitan {task.difficulty}
              </Badge>
            </div>

            <h2
              onClick={() => setIsDetailOpen(true)}
              className="text-lg sm:text-xl font-bold tracking-tight text-foreground cursor-pointer hover:text-primary transition-colors"
              title="Klik untuk melihat detail lengkap"
            >
              {task.title}
            </h2>

            {task.description && (
              <p
                onClick={() => setIsDetailOpen(true)}
                className="text-xs text-muted-foreground line-clamp-2 leading-relaxed cursor-pointer hover:text-foreground/80 transition-colors"
                title="Klik untuk melihat catatan lengkap"
              >
                {task.description}
              </p>
            )}
          </div>

          {/* Metrics Row: Deadline & Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3.5">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Tenggat Waktu
              </span>
              <p className={`text-xs font-semibold ${isPast ? 'text-destructive' : 'text-foreground'}`}>
                {deadline.toLocaleString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                  ({isPast ? 'Sudah lewat' : `${daysLeft > 0 ? `${daysLeft} hari lagi` : `${hoursLeft} jam lagi`}`})
                </span>
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-muted-foreground">Progres Pengerjaan</span>
                <span className="font-semibold text-foreground tabular-nums">
                  {task.progressPercent ?? 0}%
                </span>
              </div>
              <Progress value={task.progressPercent ?? 0} className="h-1.5" />
            </div>
          </div>

          {/* Actionable Checklists (Preparation & Subtasks) */}
          {(preparationItems.length > 0 || subtasks.length > 0) && (
            <div className="space-y-3 pt-1">
              {preparationItems.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Barang / Dokumen Persiapan
                  </p>
                  <ul className="space-y-1">
                    {preparationItems.map((item) => (
                      <ChecklistItem
                        key={item.id}
                        item={item}
                        onToggle={readOnly || !onToggleChecklist ? () => {} : onToggleChecklist}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {subtasks.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Sub-langkah Pengerjaan
                  </p>
                  <ul className="space-y-1">
                    {subtasks.map((item) => (
                      <ChecklistItem
                        key={item.id}
                        item={item}
                        onToggle={readOnly || !onToggleChecklist ? () => {} : onToggleChecklist}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <TaskDetailModal
        isOpen={isDetailOpen}
        task={task}
        onClose={() => setIsDetailOpen(false)}
        onToggleChecklist={onToggleChecklist}
        readOnly={readOnly}
      />
    </>
  );
}
