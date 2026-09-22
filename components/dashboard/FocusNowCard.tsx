'use client';

import { motion } from 'framer-motion';
import type { Task } from '@/lib/types';

type Props = { task: Task | null };

export default function FocusNowCard({ task }: Props) {
  if (!task) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-500 italic">
        Nggak ada tugas aktif. Santai dulu! 🎉
      </div>
    );
  }

  const deadline = new Date(task.currentDeadline);
  const hoursLeft = Math.max(0, Math.round((deadline.getTime() - Date.now()) / 3600000));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl shadow-lg p-6"
    >
      <p className="text-xs uppercase tracking-wide opacity-80 mb-1">🔥 Focus Now</p>
      <h3 className="text-xl font-bold mb-2">{task.title}</h3>
      {task.course && <p className="text-sm opacity-90 mb-3">{task.course}</p>}

      <div className="w-full bg-white/20 rounded-full h-2.5 mb-2 overflow-hidden">
        <motion.div
          className="bg-white h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${task.progressPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-sm opacity-90">
        <span>{task.progressPercent}% selesai</span>
        <span>⏰ {hoursLeft} jam lagi</span>
      </div>
    </motion.div>
  );
}