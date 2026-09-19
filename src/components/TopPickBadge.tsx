import React from 'react';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({ label = "Top Pick", className = "" }: TopPickBadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200 ${className}`}>
      <span className="w-2 h-2 mr-1.5 rounded-full bg-orange-500 animate-pulse"></span>
      {label}
    </span>
  );
}
