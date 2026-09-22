import type { Checklist } from '@/lib/types';

type Props = {
  item: Checklist;
  onToggle: (id: string, isChecked: boolean) => void;
};

export default function ChecklistItem({ item, onToggle }: Props) {
  return (
    <li className="text-sm flex items-center gap-2">
      <input
        type="checkbox"
        checked={item.isChecked}
        onChange={(e) => onToggle(item.id, e.target.checked)}
        className="w-4 h-4 text-blue-600"
      />
      <span
        className={
          item.isChecked ? 'line-through text-gray-400' : 'text-red-600 font-medium'
        }
      >
        {item.title}
      </span>
    </li>
  );
}