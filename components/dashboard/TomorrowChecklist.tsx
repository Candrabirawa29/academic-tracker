'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TomorrowItem } from '@/lib/dashboard';

type Props = {
  items: TomorrowItem[];
  onToggle: (id: string, isChecked: boolean) => void;
};

export default function TomorrowChecklist({ items, onToggle }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">🎒 Bawaan Besok</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Nggak ada agenda besok.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={(e) => onToggle(item.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className={item.isChecked ? 'line-through text-gray-400' : 'font-medium'}>
                  {item.title}
                </span>
                <span className="text-xs text-gray-400">({item.taskTitle})</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}