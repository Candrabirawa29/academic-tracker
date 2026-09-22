import type { Task } from './types';

export type ScoredTask = Task & {
  focusScore: number;
  focusReasons: string[];
};

export function estimateRemainingMinutes(task: Task): number {
  return Math.max(0, Math.round(task.estimatedTimeMinutes * (1 - task.progressPercent / 100)));
}

export function computeFocusScore(
  task: Task,
  now: Date = new Date()
): { score: number; reasons: string[] } {
  if (task.status === 'completed') return { score: -1, reasons: [] };

  const deadline = new Date(task.currentDeadline);
  const hoursLeft = (deadline.getTime() - now.getTime()) / 3600000;
  const reasons: string[] = [];
  let score = 0;

  // Urgensi berdasarkan sisa waktu — makin dekat/lewat, makin tinggi
  if (hoursLeft < 0) {
    score += 100;
    reasons.push('⚠️ Deadline sudah lewat');
  } else if (hoursLeft <= 3) {
    score += 90;
    reasons.push('⚠️ Deadline dekat (< 3 jam)');
  } else if (hoursLeft <= 24) {
    score += 70;
    reasons.push('⚠️ Deadline dekat (< 24 jam)');
  } else if (hoursLeft <= 72) {
    score += 40;
  } else {
    score += 10;
  }

  // Progress rendah menaikkan urgensi
  if (task.progressPercent < 30) {
    score += 20;
    reasons.push(`📊 Progress masih ${task.progressPercent}%`);
  } else if (task.progressPercent < 70) {
    score += 10;
  }

  // Tingkat kesulitan
  if (task.difficulty === 'hard') {
    score += 15;
    reasons.push('🔴 Tergolong berat');
  } else if (task.difficulty === 'medium') {
    score += 5;
  }

  // Prioritas manual dari user (override tambahan, bukan pengganti)
  if (task.basePriority === 'high') score += 15;
  else if (task.basePriority === 'medium') score += 5;

  // Estimasi sisa kerja vs waktu yang tersisa sampai deadline
  const remainingMinutes = estimateRemainingMinutes(task);
  if (remainingMinutes > 0 && hoursLeft > 0 && remainingMinutes / 60 >= hoursLeft * 0.8) {
    score += 15;
    reasons.push('⏱ Estimasi sisa kerja mepet dengan deadline');
  }

  // Barang bawaan belum siap, menjelang deadline
  const uncheckedPrep = task.checklists.filter(
    (c) => c.type === 'preparation_item' && !c.isChecked
  );
  if (uncheckedPrep.length > 0 && hoursLeft <= 24) {
    score += 10;
    reasons.push(`🎒 ${uncheckedPrep.length} barang bawaan belum disiapkan`);
  }

  return { score: Math.round(score), reasons };
}

export function rankTasksByFocus(tasks: Task[], now: Date = new Date()): ScoredTask[] {
  return tasks
    .map((task) => {
      const { score, reasons } = computeFocusScore(task, now);
      return { ...task, focusScore: score, focusReasons: reasons };
    })
    .filter((t) => t.focusScore >= 0)
    .sort((a, b) => b.focusScore - a.focusScore);
}