'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import TaskCard from './TaskCard';
import TaskDetailModal from './TaskDetailModal';
import { CheckCircle2 } from 'lucide-react';

type Props = {
  tasks: Task[];
  onToggleChecklist?: (id: string, isChecked: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onViewDetail?: (task: Task) => void;
  readOnly?: boolean;
};

export default function TaskList({
  tasks,
  onToggleChecklist,
  onEdit,
  onDelete,
  onViewDetail,
  readOnly = false,
}: Props) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleOpenDetail = (task: Task) => {
    if (onViewDetail) {
      onViewDetail(task);
    } else {
      setSelectedTask(task);
    }
  };

  // Pastikan data task yang dibuka di modal selalu reaktif terhadap perubahan (misal checklist ditoggle)
  const activeDetailTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || selectedTask
    : null;

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm font-medium text-foreground">Tidak Ada Tugas Tercatat</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Semua agenda terselesaikan atau belum ada tugas yang ditambahkan.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleChecklist={onToggleChecklist}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetail={handleOpenDetail}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Modal Detail Tugas */}
      <TaskDetailModal
        isOpen={Boolean(activeDetailTask)}
        task={activeDetailTask}
        onClose={() => setSelectedTask(null)}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleChecklist={onToggleChecklist}
        readOnly={readOnly}
      />
    </>
  );
}
