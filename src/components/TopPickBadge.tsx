import { cn } from "@/lib/utils";

interface TopPickBadgeProps {
  className?: string;
}

export default function TopPickBadge({ className }: TopPickBadgeProps) {
  return (
    <div className={cn(
      "bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-sm inline-block",
      className
    )}>
      Top Pick
    </div>
  );
}
