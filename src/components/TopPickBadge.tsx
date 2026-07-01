import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopPickBadgeProps {
  className?: string;
}

export default function TopPickBadge({ className }: TopPickBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 bg-orange-100 text-orange-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-orange-200",
      className
    )}>
      <Star className="w-3.5 h-3.5 fill-current" />
      Top Pick
    </div>
  );
}
