import React from 'react';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({ label = 'Top Pick', className = '' }: TopPickBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-orange-100 text-orange-900 border border-orange-300 shadow-xs ${className}`}
    >
      <span className="mr-1 text-orange-600">★</span>
      {label}
    </span>
  );
}
