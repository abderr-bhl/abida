import React from 'react';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({ label = "TOP PICK", className = "" }: TopPickBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-900 border border-orange-200 ${className}`}>
      ★ {label}
    </span>
  );
}
