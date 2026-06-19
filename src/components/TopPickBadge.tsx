import { Award } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TopPickBadgeProps {
  className?: string;
}

export default function TopPickBadge({ className }: TopPickBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wider dark:bg-yellow-900/30 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-800/50",
        className
      )}
    >
      <Award className="w-3.5 h-3.5" />
      <span>Top Pick</span>
    </div>
  );
}
