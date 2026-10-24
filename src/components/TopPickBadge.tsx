import { Award } from 'lucide-react';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({ label = "TOP PICK", className = "" }: TopPickBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-orange-100 text-orange-900 border border-orange-300 px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase shadow-xs ${className}`}
    >
      <Award className="w-4 h-4 text-orange-700" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
