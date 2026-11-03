import React from 'react';
import { Award } from 'lucide-react';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({
  label = 'TOP PICK • WIRECUTTER-LEVEL STANDARD',
  className = ''
}: TopPickBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-orange-100 text-orange-900 border border-orange-300 shadow-sm ${className}`}
    >
      <Award className="w-3.5 h-3.5 text-orange-700" />
      <span>{label}</span>
    </div>
  );
}
