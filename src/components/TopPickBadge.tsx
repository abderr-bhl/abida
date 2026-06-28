import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopPickBadgeProps {
  className?: string;
  label?: string;
}

export default function TopPickBadge({ className, label = 'Top Pick' }: TopPickBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 bg-amazon-orange text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm",
      className
    )}>
      <Star size={14} fill="currentColor" />
      {label}
    </div>
  );
}
