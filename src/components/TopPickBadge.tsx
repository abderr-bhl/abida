import React from 'react';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({ label = "Top Pick", className = "" }: TopPickBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-700 shadow-sm ${className}`}
    >
      <span className="mr-1 text-orange-600 dark:text-orange-300">★</span>
      {label}
    </span>
  );
}
