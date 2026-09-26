'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';

type DeleteTaskDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onDelete: (taskId: string) => Promise<boolean>;
};

function emptySubscribe() {
  return () => {};
}

export default function DeleteTaskDialog({
  isOpen,
  onClose,
  task,
  onDelete,
}: DeleteTaskDialogProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [isDeleting, setIsDeleting] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isClient || !isOpen || !task) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      const ok = await onDelete(task.id);
      if (ok) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
      />

      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg z-10 animate-in zoom-in-95 duration-200 space-y-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive shrink-0">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-semibold text-foreground">
              Hapus Tugas Ini?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Apakah kamu yakin ingin menghapus tugas{' '}
              <span className="font-semibold text-foreground">
                &ldquo;{task.title}&rdquo;
              </span>
              ? Tindakan ini permanen dan semua checklist persiapan serta subtask terkait akan ikut dihapus.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 text-xs font-medium"
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="h-9 px-4 text-xs font-semibold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Hapus Tugas
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
