import type { Task } from './types';
import { rankTasksByFocus } from './scoring';

export type TaskStats = {
  completed: number;
  inProgress: number;
  late: number;
  upcoming: number;
};

export function computeStats(tasks: Task[]): TaskStats {
  const now = new Date();
  let completed = 0;
  let inProgress = 0;
  let late = 0;
  let upcoming = 0;

  for (const task of tasks) {
    const deadline = new Date(task.currentDeadline);
    if (task.status === 'completed') {
      completed++;
    } else if (deadline < now) {
      late++;
    } else if (task.progressPercent > 0) {
      inProgress++;
    } else {
      upcoming++;
    }
  }

  return { completed, inProgress, late, upcoming };
}

export type WorkloadPoint = {
  label: string;
  count: number;
};

export function computeWorkload(tasks: Task[]): WorkloadPoint[] {
  const days: WorkloadPoint[] = [];
  const dayFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });

  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setDate(day.getDate() + i);
    day.setHours(0, 0, 0, 0);

    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const count = tasks.filter((task) => {
      const deadline = new Date(task.currentDeadline);
      return deadline >= day && deadline < nextDay && task.status !== 'completed';
    }).length;

    days.push({ label: i === 0 ? 'Hari ini' : dayFormatter.format(day), count });
  }

  return days;
}

// Sekarang delegasi ke lib/scoring.ts — satu sumber kebenaran yang sama dipakai
// oleh endpoint /api/tasks/focus (dan lewat itu, bot WhatsApp)
export function getFocusTask(tasks: Task[]): Task | null {
  const ranked = rankTasksByFocus(tasks);
  return ranked[0] ?? null;
}

export type TomorrowItem = {
  id: string;
  title: string;
  isChecked: boolean;
  taskTitle: string;
};

export function getTomorrowChecklist(tasks: Task[]): TomorrowItem[] {
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

  return tasks
    .filter((t) => {
      const deadline = new Date(t.currentDeadline);
      return deadline >= tomorrowStart && deadline < tomorrowEnd;
    })
    .flatMap((t) =>
      t.checklists
        .filter((c) => c.type === 'preparation_item')
        .map((c) => ({ id: c.id, title: c.title, isChecked: c.isChecked, taskTitle: t.title }))
    );
}