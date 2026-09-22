'use client';

import { useState } from 'react';
import type { NewTaskPayload, Difficulty, Priority } from '@/lib/types';
import ChecklistInputList from './ChecklistInputList';

type Props = {
  userId: string;
  loading: boolean;
  onSubmit: (payload: NewTaskPayload) => Promise<boolean>;
};

const initialState = {
  title: '',
  course: '',
  description: '',
  deadline: '',
  difficulty: 'medium' as Difficulty,
  priority: 'medium' as Priority,
  estimatedHours: '',
};

export default function TaskForm({ userId, loading, onSubmit }: Props) {
  const [form, setForm] = useState(initialState);
  const [preparationItems, setPreparationItems] = useState<string[]>(['']);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof typeof initialState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const checklists = [
      ...preparationItems
        .filter((t) => t.trim() !== '')
        .map((title) => ({ title, type: 'preparation_item' as const })),
      ...subtasks
        .filter((t) => t.trim() !== '')
        .map((title) => ({ title, type: 'subtask' as const })),
    ];

    const payload: NewTaskPayload = {
      userId,
      title: form.title,
      course: form.course || undefined,
      description: form.description || undefined,
      currentDeadline: form.deadline,
      difficulty: form.difficulty,
      basePriority: form.priority,
      estimatedTimeMinutes: form.estimatedHours
        ? Math.round(parseFloat(form.estimatedHours) * 60)
        : 0,
      checklists,
    };

    const success = await onSubmit(payload);
    if (success) {
      setForm(initialState);
      setPreparationItems(['']);
      setSubtasks([]);
    } else {
      setError('Gagal nyimpen tugas. Coba lagi.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-fit">
      <h2 className="text-xl font-bold mb-4">Tambah Agenda</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Nama Tugas</label>
          <input
            required
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full border p-2 rounded-lg"
            placeholder="Contoh: Laporan Web"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Mata Kuliah</label>
          <input
            type="text"
            value={form.course}
            onChange={(e) => updateField('course', e.target.value)}
            className="w-full border p-2 rounded-lg"
            placeholder="Contoh: Struktur Data"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Catatan</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full border p-2 rounded-lg"
            placeholder="Catatan tambahan..."
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Deadline</label>
          <input
            required
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => updateField('deadline', e.target.value)}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Kesulitan</label>
            <select
              value={form.difficulty}
              onChange={(e) => updateField('difficulty', e.target.value)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="easy">🟢 Mudah</option>
              <option value="medium">🟡 Sedang</option>
              <option value="hard">🔴 Berat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Prioritas</label>
            <select
              value={form.priority}
              onChange={(e) => updateField('priority', e.target.value)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">🔥 Tinggi</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Estimasi Waktu (jam)</label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={form.estimatedHours}
            onChange={(e) => updateField('estimatedHours', e.target.value)}
            className="w-full border p-2 rounded-lg"
            placeholder="Contoh: 2.5"
          />
        </div>

        <ChecklistInputList
          label="🎒 Barang Wajib Bawa"
          placeholder="Contoh: Hardcopy Laporan"
          items={preparationItems}
          onChange={setPreparationItems}
          accentClass="bg-red-50 border-red-200"
        />

        <ChecklistInputList
          label="✅ Sub-langkah Pengerjaan"
          placeholder="Contoh: Riset materi"
          items={subtasks}
          onChange={setSubtasks}
          accentClass="bg-gray-50 border-gray-200"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
}