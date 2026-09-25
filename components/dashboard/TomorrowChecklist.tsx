'use client';

import type { TomorrowItem } from '@/lib/dashboard';
import { Briefcase, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  items: TomorrowItem[];
  onToggle?: (id: string, isChecked: boolean) => void;
  readOnly?: boolean;
};

export default function TomorrowChecklist({ items, onToggle, readOnly = false }: Props) {
  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
          </div>
          <div>
            <CardTitle className="text-xs font-semibold">Persiapan Dokumen / Fisik</CardTitle>
            <CardDescription className="text-[11px]">
              Barang & berkas yang perlu dibawa besok
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3">
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Tidak ada barang bawaan khusus untuk besok.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2.5 rounded-md border border-border bg-muted/20 px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/40"
              >
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => onToggle && onToggle(item.id, !item.isChecked)}
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                    item.isChecked
                      ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
                      : "border-input bg-card hover:border-foreground/50",
                    readOnly ? "cursor-default" : "cursor-pointer"
                  )}
                >
                  {item.isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </button>
                <span
                  className={cn(
                    "flex-1 text-xs truncate",
                    item.isChecked ? "line-through text-muted-foreground" : "text-foreground font-medium"
                  )}
                >
                  {item.title}
                </span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[120px] font-normal">
                  {item.taskTitle}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}