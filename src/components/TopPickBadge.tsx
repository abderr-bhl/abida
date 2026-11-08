import { cn } from '@/lib/utils';

interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({ label = "Top Pick", className = "" }: TopPickBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300 shadow-sm",
        className
      )}
    >
      <span className="text-orange-600 font-black">★</span>
      {label}
    </span>
  );
}
