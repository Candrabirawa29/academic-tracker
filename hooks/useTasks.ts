'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Task, NewTaskPayload, UpdateTaskPayload } from '@/lib/types';

export function useTasks(userId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const url = userId ? `/api/tasks?userId=${encodeURIComponent(userId)}` : '/api/tasks';
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      } else {
        setError(result.error || 'Gagal memuat tugas');
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
      setError('Koneksi bermasalah');
    }
  }, [userId]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const url = userId ? `/api/tasks?userId=${encodeURIComponent(userId)}` : '/api/tasks';
        const response = await fetch(url);
        const result = await response.json();
        if (!ignore) {
          if (result.success) {
            setTasks(result.data);
          } else {
            setError(result.error || 'Gagal memuat tugas');
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error('Gagal mengambil data:', err);
          setError('Koneksi bermasalah');
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const createTask = useCallback(
    async (payload: NewTaskPayload): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (response.ok && result.success) {
          toast.success('Agenda tugas berhasil dibuat! 🎯');
          await fetchTasks();
          return true;
        }
        toast.error(result.error || 'Gagal membuat tugas');
        return false;
      } catch (error) {
        console.error('Gagal menyimpan tugas:', error);
        toast.error('Terjadi kesalahan jaringan saat membuat tugas');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchTasks]
  );

  const updateTask = useCallback(
    async (taskId: string, payload: UpdateTaskPayload): Promise<boolean> => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (response.ok && result.success) {
          toast.success('Tugas berhasil diperbarui! ✨');
          await fetchTasks();
          return true;
        }
        toast.error(result.error || 'Gagal memperbarui tugas');
        return false;
      } catch (error) {
        console.error('Gagal update tugas:', error);
        toast.error('Terjadi kesalahan jaringan saat update tugas');
        return false;
      }
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      try {
        // Optimistic update: langsung bersihkan dari list lokal
        setTasks((prev) => prev.filter((t) => t.id !== taskId));

        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (response.ok && result.success) {
          toast.success('Tugas berhasil dihapus! 🗑️');
          await fetchTasks();
          return true;
        }
        toast.error(result.error || 'Gagal menghapus tugas');
        await fetchTasks();
        return false;
      } catch (error) {
        console.error('Gagal menghapus tugas:', error);
        toast.error('Terjadi kesalahan jaringan saat menghapus tugas');
        await fetchTasks();
        return false;
      }
    },
    [fetchTasks]
  );

  const toggleChecklist = useCallback(
    async (checklistId: string, isChecked: boolean) => {
      setTasks((prev) =>
        prev.map((task) => ({
          ...task,
          checklists: task.checklists.map((item) =>
            item.id === checklistId ? { ...item, isChecked } : item
          ),
        }))
      );

      try {
        const response = await fetch(`/api/checklists/${checklistId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isChecked }),
        });
        if (!response.ok) {
          await fetchTasks();
        }
      } catch (error) {
        console.error('Gagal update checklist:', error);
        await fetchTasks();
      }
    },
    [fetchTasks]
  );

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleChecklist,
    refetch: fetchTasks,
  };
}
