'use client';

import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Props = {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
};

export default function ChecklistInputList({
  label,
  placeholder,
  items,
  onChange,
}: Props) {
  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const addItem = () => onChange([...items, '']);
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addItem}
          className="h-6 px-2 text-[11px] font-medium text-primary hover:text-primary/80"
        >
          <Plus className="h-3 w-3 mr-1" />
          Tambah Item
        </Button>
      </div>

      <div className="space-y-1.5">
        {items.length === 0 && (
          <p className="text-[11px] text-muted-foreground italic py-0.5">Belum ada item ditambahkan.</p>
        )}
        {items.map((value, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <Input
              type="text"
              value={value}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 h-8 text-xs bg-card border-input"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Hapus item"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}