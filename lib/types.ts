export type ChecklistType = 'subtask' | 'preparation_item';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Priority = 'low' | 'medium' | 'high';

export type Checklist = {
  id: string;
  title: string;
  isChecked: boolean;
  type: ChecklistType;
};

// Alias to ensure consistent naming across components
export type ChecklistItem = Checklist;

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | string;

export type Task = {
  id: string;
  title: string;
  description: string | null;
  course: string | null;
  status: string;
  currentDeadline: string;
  progressPercent: number;
  progressUpdatedAt: string | null;
  difficulty: string;
  basePriority: string;
  estimatedTimeMinutes: number;
  checklists: Checklist[];
};

export type NewTaskPayload = {
  userId: string;
  title: string;
  description?: string;
  course?: string;
  currentDeadline: string;
  difficulty: Difficulty;
  basePriority: Priority;
  estimatedTimeMinutes: number;
  checklists: { title: string; type: ChecklistType }[];
};

export type AuthUser = {
  id: string;
  name: string;
  role: string;
  email?: string;
  whatsappNumber?: string;
};

export type SessionPayload = {
  userId: string;
  name: string;
  role: string;
  exp: number;
};
