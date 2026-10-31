import { Award } from 'lucide-react';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({
  label = "Top Pick",
  className = "",
}: TopPickBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-800 shadow-xs ${className}`}
    >
      <Award className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
      <span>{label}</span>
    </span>
  );
}
