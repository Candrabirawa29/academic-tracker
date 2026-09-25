'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task, NewTaskPayload } from '@/lib/types';

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
    async (payload: NewTaskPayload) => {
      setLoading(true);
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          await fetchTasks();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Gagal menyimpan tugas:', error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchTasks]
  );

  // Optimistic update: UI langsung berubah, baru sinkron ke server di belakang.
  // Kalau gagal, di-refetch buat balikin ke state yang bener.
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

  return { tasks, loading, error, createTask, toggleChecklist, refetch: fetchTasks };
}