'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import ChecklistItem from './ChecklistItem';
import {
  Calendar,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

type Props = {
  task: Task;
  onToggleChecklist?: (id: string, isChecked: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  readOnly?: boolean;
};

export default function TaskCard({
  task,
  onToggleChecklist,
  onEdit,
  onDelete,
  readOnly = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const preparationItems =
    task.checklists?.filter((c) => c.type === 'preparation_item') ?? [];

  const subtasks =
    task.checklists?.filter((c) => c.type === 'subtask') ?? [];

  const totalChecklists = preparationItems.length + subtasks.length;
  const completedChecklists = [
    ...preparationItems,
    ...subtasks,
  ].filter((c) => c.isChecked).length;

  const deadline = new Date(task.currentDeadline);
  const now = new Date();
  const isPast = deadline < now && task.status !== 'completed';

  const statusVariant: 'success' | 'info' | 'secondary' = {
    completed: 'success' as const,
    in_progress: 'info' as const,
    not_started: 'secondary' as const,
  }[task.status] || 'secondary';

  const statusLabel = {
    completed: 'Selesai',
    in_progress: 'Berjalan',
    not_started: 'Antrian',
  }[task.status] || task.status;

  const priorityVariant: 'destructive' | 'warning' | 'secondary' = {
    high: 'destructive' as const,
    medium: 'warning' as const,
    low: 'secondary' as const,
  }[task.basePriority] || 'secondary';

  return (
    <div className="group rounded-lg border border-border bg-card shadow-xs transition-all hover:border-foreground/20">
      <div className="p-3.5 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Main info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Badge variant={statusVariant} className="text-[10px] h-5 px-1.5">
                {statusLabel}
              </Badge>

              {task.course && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  <BookOpen className="h-3 w-3" />
                  {task.course}
                </span>
              )}

              <Badge variant={priorityVariant} className="text-[10px] h-5 px-1.5">
                {task.basePriority === 'high' ? 'Tinggi' : task.basePriority === 'medium' ? 'Sedang' : 'Rendah'}
              </Badge>
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {task.title}
              </h3>
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {task.description}
              </p>
            )}
          </div>

          {/* Metrics & actions */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 text-xs">
            {/* Deadline */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={`font-medium ${isPast ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                {deadline.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })} · {deadline.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 min-w-[90px]">
              <Progress value={task.progressPercent ?? 0} className="w-14 h-1.5" />
              <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                {task.progressPercent ?? 0}%
              </span>
            </div>

            {/* Checklist toggle button if items exist */}
            {totalChecklists > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <CheckSquare className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>{completedChecklists}/{totalChecklists}</span>
                {expanded ? (
                  <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>
            )}

            {/* Action Buttons: Edit & Delete (hanya saat not readOnly) */}
            {!readOnly && (
              <div className="flex items-center gap-0.5 border-l border-border/60 pl-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(task);
                  }}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Edit Tugas"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(task);
                  }}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Hapus Tugas"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded checklist section */}
      {expanded && totalChecklists > 0 && (
        <div className="border-t border-border bg-muted/20 p-3.5 rounded-b-lg space-y-3">
          {preparationItems.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
    </div>
  );
}
