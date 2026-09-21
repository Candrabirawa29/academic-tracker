'use client';

import { useState, useEffect, useCallback } from 'react';

// Struktur tipe data biar TypeScript nggak error
type Checklist = { id: string; title: string; isChecked: boolean };
type Task = { id: string; title: string; currentDeadline: string; checklists: Checklist[] };

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const USER_ID = "1070b337-6f92-4500-90df-f510c1bde9c9"; // GANTI DENGAN UUID LO

  // Fungsi untuk narik data dari API GET
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks?userId=${USER_ID}`);
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    }
  }, [USER_ID]);

  // Load data saat komponen pertama kali dirender
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  const form = e.currentTarget; // simpan referensi form di sini, sebelum await manapun
  const formData = new FormData(form);

  const payload = {
    userId: "1070b337-6f92-4500-90df-f510c1bde9c9",
    title: formData.get('title'),
    description: formData.get('description'),
    currentDeadline: formData.get('deadline'),
    checklists: [
      {
        title: formData.get('preparation'),
        type: "preparation_item"
      }
    ]
  };

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('Tugas dan barang bawaan berhasil disimpan!');
      form.reset(); // pakai variabel yang udah disimpan, bukan e.currentTarget
      fetchTasks();
    } else {
      alert('Gagal nyimpen tugas.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen p-8 bg-gray-100 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Form Input */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4">Tambah Agenda</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Nama Tugas</label>
              <input name="title" required type="text" className="w-full border p-2 rounded-lg" placeholder="Contoh: Laporan Web" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Deadline</label>
              <input name="deadline" required type="datetime-local" className="w-full border p-2 rounded-lg" />
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <label className="block text-sm font-bold text-red-700 mb-1">🎒 Barang Wajib Bawa</label>
              <input name="preparation" required type="text" className="w-full border p-2 rounded-lg" placeholder="Contoh: Hardcopy Laporan" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Dashboard List Tugas */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">🔥 Focus Now</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada tugas. Santai dulu, Damar.</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="text-lg font-bold">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    🗓️ Deadline: {new Date(task.currentDeadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                </div>
                
                {/* List Barang Bawaan */}
                <div className="mt-4 md:mt-0 bg-gray-50 p-3 rounded-lg min-w-[200px]">
                  <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Preparation Check</p>
                  <ul className="space-y-1">
                    {task.checklists.map((item) => (
                      <li key={item.id} className="text-sm flex items-center gap-2">
                        <input type="checkbox" defaultChecked={item.isChecked} className="w-4 h-4 text-blue-600" />
                        <span className={item.isChecked ? 'line-through text-gray-400' : 'text-red-600 font-medium'}>
                          {item.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>
    </main>
  );
}