import { cn } from '@/lib/utils';

export function TopPickBadge({ className }: { className?: string }) {
  return (
    <div className={cn(
      "absolute top-0 left-0 bg-orange-100 text-orange-900 text-xs font-bold px-3 py-1 rounded-br-lg z-10 border-b border-r border-orange-200",
      className
    )}>
      TOP PICK
    </div>
  );
}
