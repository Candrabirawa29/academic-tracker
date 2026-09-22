import type { Task } from '@/lib/types';
import TaskCard from './TaskCard';

type Props = {
  tasks: Task[];
  onToggleChecklist: (id: string, isChecked: boolean) => void;
};

export default function TaskList({ tasks, onToggleChecklist }: Props) {
  if (tasks.length === 0) {
    return <p className="text-gray-500 italic">Belum ada tugas. Santai dulu, Damar.</p>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggleChecklist={onToggleChecklist} />
      ))}
    </div>
  );
}