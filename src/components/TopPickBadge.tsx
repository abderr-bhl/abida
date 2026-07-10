import { cn } from "@/lib/utils";

interface TopPickBadgeProps {
  className?: string;
}

export default function TopPickBadge({ className }: TopPickBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200",
        className
      )}
    >
      <span className="mr-1">★</span>
      Top Pick
    </div>
  );
}
