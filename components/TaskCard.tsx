import type { Task } from '@/lib/types';
import ChecklistItem from './ChecklistItem';

type Props = {
  task: Task;
  onToggleChecklist: (id: string, isChecked: boolean) => void;
};

export default function TaskCard({ task, onToggleChecklist }: Props) {
  const preparationItems = task.checklists.filter(
    (c) => c.type === 'preparation_item'
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h3 className="text-lg font-bold">{task.title}</h3>
        {task.course && (
          <p className="text-sm text-blue-600 font-medium">{task.course}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          🗓️ Deadline:{' '}
          {new Date(task.currentDeadline).toLocaleString('id-ID', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}
        </p>
      </div>

      {preparationItems.length > 0 && (
        <div className="mt-4 md:mt-0 bg-gray-50 p-3 rounded-lg min-w-[200px]">
          <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
            Preparation Check
          </p>
          <ul className="space-y-1">
            {preparationItems.map((item) => (
              <ChecklistItem key={item.id} item={item} onToggle={onToggleChecklist} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}