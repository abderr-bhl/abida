import React from 'react';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({ label = 'Top Pick', className = '' }: TopPickBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 uppercase tracking-wider shadow-xs ${className}`}
    >
      <span className="mr-1.5 h-2 w-2 rounded-full bg-orange-600 inline-block"></span>
      {label}
    </span>
  );
}
