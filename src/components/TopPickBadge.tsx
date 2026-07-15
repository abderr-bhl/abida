import React from 'react';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopPickBadgeProps {
  className?: string;
}

export function TopPickBadge({ className }: TopPickBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-200 font-bold text-xs uppercase tracking-wider shadow-sm",
      className
    )}>
      <Award size={14} className="text-orange-600" />
      Top Pick
    </div>
  );
}
