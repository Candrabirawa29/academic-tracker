'use client';

type Props = {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  accentClass?: string;
};

export default function ChecklistInputList({
  label,
  placeholder,
  items,
  onChange,
  accentClass = 'bg-gray-50 border-gray-200',
}: Props) {
  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const addItem = () => onChange([...items, '']);
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className={`p-4 rounded-lg border ${accentClass}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold">{label}</label>
        <button
          type="button"
          onClick={addItem}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          + Tambah
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-gray-400 italic">Belum ada item.</p>
        )}
        {items.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 border p-2 rounded-lg text-sm"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-gray-400 hover:text-red-600 px-2"
              aria-label="Hapus item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}