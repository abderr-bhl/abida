import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopPickBadgeProps {
  className?: string;
  label?: string;
}

export function TopPickBadge({ className, label = "Our Top Pick" }: TopPickBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 bg-orange-100 text-orange-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm",
      className
    )}>
      <Star size={14} className="fill-orange-500 text-orange-500" />
      {label}
    </div>
  );
}
