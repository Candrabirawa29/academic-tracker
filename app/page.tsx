'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import StatsOverview from '@/components/dashboard/StatsOverview';
import WorkloadChart from '@/components/dashboard/WorkloadChart';
import FocusNowCard from '@/components/dashboard/FocusNowCard';
import TomorrowChecklist from '@/components/dashboard/TomorrowChecklist';
import {
  computeStats,
  computeWorkload,
  getFocusTask,
  getTomorrowChecklist,
} from '@/lib/dashboard';

const USER_ID = '1070b337-6f92-4500-90df-f510c1bde9c9'; // GANTI DENGAN UUID LO

export default function Home() {
  const { tasks, loading, createTask, toggleChecklist } = useTasks(USER_ID);

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const workload = useMemo(() => computeWorkload(tasks), [tasks]);
  const focusTask = useMemo(() => getFocusTask(tasks), [tasks]);
  const tomorrowItems = useMemo(() => getTomorrowChecklist(tasks), [tasks]);

  const today = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <main className="min-h-screen p-6 md:p-8 bg-gray-100 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold">Good day 👋</h1>
          <p className="text-gray-500">{today}</p>
        </motion.div>

        <StatsOverview stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FocusNowCard task={focusTask} />
            <WorkloadChart data={workload} />

            <div>
              <h2 className="text-xl font-bold mb-4">📚 Semua Tugas</h2>
              <TaskList tasks={tasks} onToggleChecklist={toggleChecklist} />
            </div>
          </div>

          <div className="space-y-6">
            <TaskForm userId={USER_ID} loading={loading} onSubmit={createTask} />
            <TomorrowChecklist items={tomorrowItems} onToggle={toggleChecklist} />
          </div>
        </div>
      </div>
    </main>
  );
}