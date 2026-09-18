import React from 'react';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export function TopPickBadge({ label = 'Top Pick', className }: TopPickBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300 shadow-sm',
        className
      )}
    >
      <Award className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
      <span>{label}</span>
    </span>
  );
}

export default TopPickBadge;
