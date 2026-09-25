'use client';

import { Check } from 'lucide-react';
import type { ChecklistItem as ChecklistItemType } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  item: ChecklistItemType;
  onToggle: (id: string, isChecked: boolean) => void;
};

export default function ChecklistItem({ item, onToggle }: Props) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onToggle(item.id, !item.isChecked)}
        className="group/check flex w-full items-center gap-2.5 rounded-md px-2 py-1 text-left transition-colors hover:bg-muted/50"
      >
        {/* Subtle Checkbox */}
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
            item.isChecked
              ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
              : "border-input bg-card group-hover/check:border-primary/70"
          )}
        >
          {item.isChecked && <Check className="h-3 w-3 stroke-[3]" />}
        </span>

        {/* Label */}
        <span
          className={cn(
            "flex-1 text-xs transition-colors",
            item.isChecked ? "text-muted-foreground line-through" : "text-foreground"
          )}
        >
          {item.title}
        </span>
      </button>
    </li>
  );
}