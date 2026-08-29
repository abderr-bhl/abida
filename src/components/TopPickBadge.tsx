import React from 'react';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export function TopPickBadge({ label = 'Top Pick', className = '' }: TopPickBadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-900 border border-orange-200 uppercase tracking-wider ${className}`}>
      ★ {label}
    </span>
  );
}
export default TopPickBadge;
