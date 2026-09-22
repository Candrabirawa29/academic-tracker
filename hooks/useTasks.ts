'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task, NewTaskPayload } from '@/lib/types';

export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks?userId=${userId}`);
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

  return { tasks, loading, createTask, toggleChecklist, refetch: fetchTasks };
}