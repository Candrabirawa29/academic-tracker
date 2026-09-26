'use client';

import { useState, useEffect, useSyncExternalStore, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Task } from '@/lib/types';
import { extractUrls, getLinkMetadata, formatTextWithLinks } from '@/lib/urlUtils';
import {
  Calendar,
  Clock,
  BookOpen,
  ExternalLink,
  CheckSquare,
  Square,
  Copy,
  Check,
  Pencil,
  Trash2,
  X,
  Gauge,
  Flag,
  Link2,
  FileText,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

type TaskDetailModalProps = {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onToggleChecklist?: (id: string, isChecked: boolean) => void;
  readOnly?: boolean;
};

function emptySubscribe() {
  return () => {};
}

export default function TaskDetailModal({
  isOpen,
  task,
  onClose,
  onEdit,
  onDelete,
  onToggleChecklist,
  readOnly = false,
}: TaskDetailModalProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Extract all submission / reference links from description and checklists
  const detectedLinks = useMemo(() => {
    if (!task) return [];
    const fromDesc = extractUrls(task.description);
    const fromChecklists: string[] = [];
    task.checklists?.forEach((c) => {
      const urlsInChecklist = extractUrls(c.title);
      fromChecklists.push(...urlsInChecklist);
    });

    const uniqueUrls = Array.from(new Set([...fromDesc, ...fromChecklists]));
    return uniqueUrls.map((url) => getLinkMetadata(url));
  }, [task]);

  if (!isClient || !isOpen || !task) return null;

  const deadline = new Date(task.currentDeadline);
  const now = new Date();
  const msLeft = deadline.getTime() - now.getTime();
  const isPast = msLeft < 0 && task.status !== 'completed';
  const hoursLeft = Math.round(msLeft / 3600000);
  const daysLeft = Math.ceil(msLeft / 86400000);

  const preparationItems =
    task.checklists?.filter((c) => c.type === 'preparation_item') ?? [];
  const subtasks =
    task.checklists?.filter((c) => c.type === 'subtask') ?? [];

  const totalChecklists = preparationItems.length + subtasks.length;
  const completedChecklists = [
    ...preparationItems,
    ...subtasks,
  ].filter((c) => c.isChecked).length;

  const statusVariant: 'success' | 'info' | 'secondary' = {
    completed: 'success' as const,
    in_progress: 'info' as const,
    not_started: 'secondary' as const,
  }[task.status] || 'secondary';

  const statusLabel = {
    completed: 'Selesai',
    in_progress: 'Sedang Dikerjakan',
    not_started: 'Dalam Antrian',
  }[task.status] || task.status;

  const priorityVariant: 'destructive' | 'warning' | 'secondary' = {
    high: 'destructive' as const,
    medium: 'warning' as const,
    low: 'secondary' as const,
  }[task.basePriority] || 'secondary';

  const priorityLabel = {
    high: 'Tinggi',
    medium: 'Sedang',
    low: 'Rendah',
  }[task.basePriority] || task.basePriority;

  const difficultyLabel = {
    hard: 'Berat',
    medium: 'Sedang',
    easy: 'Mudah',
  }[task.difficulty] || task.difficulty;

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('Tautan berhasil disalin! 📋');
      setTimeout(() => {
        setCopiedUrl(null);
      }, 2000);
    } catch {
      toast.error('Gagal menyalin tautan');
    }
  };

  const handleShareTask = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: task.title,
          text: `Tugas: ${task.title} (${task.course || 'Akademik'}) - Deadline: ${deadline.toLocaleDateString('id-ID')}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link halaman berhasil disalin!');
      }
    } catch {
      // User cancelled share
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200"
    >
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border bg-card px-5 py-4 shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Badge variant={statusVariant} className="text-[11px] h-5 px-2 font-medium">
                {statusLabel}
              </Badge>

              {task.course && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md border border-border/50">
                  <BookOpen className="h-3 w-3 text-primary" />
                  {task.course}
                </span>
              )}

              <Badge variant={priorityVariant} className="text-[11px] h-5 px-2 font-medium">
                <Flag className="h-3 w-3 mr-1" />
                Prioritas {priorityLabel}
              </Badge>

              <Badge variant="outline" className="text-[11px] h-5 px-2 font-medium">
                <Gauge className="h-3 w-3 mr-1 text-muted-foreground" />
                Kesulitan {difficultyLabel}
              </Badge>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug break-words">
              {task.title}
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShareTask}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Bagikan Informasi Tugas"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Tutup (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* 1. SECTION: TAUTAN PENGUMPULAN (HIGHLIGHTED) */}
          {detectedLinks.length > 0 && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-4.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b border-primary/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Link2 className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                      Link Pengumpulan & Tautan Tugas
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Tersedia {detectedLinks.length} tautan untuk pengerjaan atau pengumpulan tugas ini:
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {detectedLinks.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-border/70 bg-card p-3 shadow-xs hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="mt-0.5 p-1.5 rounded-md bg-muted text-foreground shrink-0">
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {item.label}
                          </span>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                            {item.badge}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                          {item.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(item.url)}
                        className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        {copiedUrl === item.url ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </Button>

                      <Button
                        asChild
                        size="sm"
                        className="h-8 px-3 text-xs gap-1.5 font-medium shadow-xs"
                      >
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <span>Buka Link</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. SECTION: METADATA & DEADLINE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tenggat Waktu */}
            <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Tenggat Waktu
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isPast
                    ? 'bg-destructive/15 text-destructive'
                    : hoursLeft <= 24
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isPast ? 'Lewat Tenggat' : daysLeft > 0 ? `${daysLeft} hari lagi` : `Sisa ${hoursLeft} jam`}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground pt-0.5">
                {deadline.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pukul {deadline.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </p>
            </div>

            {/* Progres & Estimasi */}
            <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Progres Pengerjaan</span>
                <span className="font-bold text-foreground tabular-nums text-sm">
                  {task.progressPercent ?? 0}%
                </span>
              </div>
              <Progress value={task.progressPercent ?? 0} className="h-2" />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span>Estimasi Waktu:</span>
                <span className="font-medium text-foreground">
                  {task.estimatedTimeMinutes ? `${task.estimatedTimeMinutes} menit (~ ${Math.round(task.estimatedTimeMinutes / 60 * 10) / 10} jam)` : 'Belum diisi'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. SECTION: CATATAN & INSTRUKSI PENGERJAAN */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Catatan & Instruksi Tugas
            </h3>

            <div className="rounded-lg border border-border bg-card p-4 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {task.description ? (
                formatTextWithLinks(task.description)
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground py-1 text-xs">
                  <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
                  <span>Tidak ada catatan atau instruksi khusus untuk tugas ini.</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. SECTION: CHECKLISTS */}
          {totalChecklists > 0 && (
            <div className="space-y-3 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Daftar Periksa & Langkah Pengerjaan
                </h3>
                <span className="text-xs text-muted-foreground font-medium">
                  {completedChecklists} dari {totalChecklists} selesai
                </span>
              </div>

              {/* Barang Persiapan */}
              {preparationItems.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Barang / Berkas Wajib Dibawa:
                  </p>
                  <ul className="space-y-1.5">
                    {preparationItems.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => {
                          if (!readOnly && onToggleChecklist) {
                            onToggleChecklist(item.id, !item.isChecked);
                          }
                        }}
                        className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition-colors ${
                          item.isChecked
                            ? 'border-border/50 bg-muted/40 text-muted-foreground line-through'
                            : 'border-border bg-card text-foreground'
                        } ${!readOnly && onToggleChecklist ? 'cursor-pointer hover:border-primary/40' : ''}`}
                      >
                        <span className="mt-0.5 shrink-0 text-primary">
                          {item.isChecked ? (
                            <CheckSquare className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </span>
                        <span className="flex-1 leading-snug break-words">
                          {formatTextWithLinks(item.title)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Subtasks */}
              {subtasks.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Sub-langkah Pengerjaan:
                  </p>
                  <ul className="space-y-1.5">
                    {subtasks.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => {
                          if (!readOnly && onToggleChecklist) {
                            onToggleChecklist(item.id, !item.isChecked);
                          }
                        }}
                        className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition-colors ${
                          item.isChecked
                            ? 'border-border/50 bg-muted/40 text-muted-foreground line-through'
                            : 'border-border bg-card text-foreground'
                        } ${!readOnly && onToggleChecklist ? 'cursor-pointer hover:border-primary/40' : ''}`}
                      >
                        <span className="mt-0.5 shrink-0 text-primary">
                          {item.isChecked ? (
                            <CheckSquare className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </span>
                        <span className="flex-1 leading-snug break-words">
                          {formatTextWithLinks(item.title)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 border-t border-border bg-muted/30 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2">
            {!readOnly && (
              <>
                {onEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onEdit(task);
                    }}
                    className="h-8.5 px-3 text-xs gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit Tugas</span>
                  </Button>
                )}

                {onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onDelete(task);
                    }}
                    className="h-8.5 px-3 text-xs gap-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8.5 px-4 text-xs font-medium"
            >
              Tutup
            </Button>

            {detectedLinks.length > 0 && (
              <Button
                asChild
                size="sm"
                className="h-8.5 px-4 text-xs font-semibold gap-1.5 shadow-xs"
              >
                <a href={detectedLinks[0].url} target="_blank" rel="noopener noreferrer">
                  <span>Buka Link Utama</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
