interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({ label = "Top Pick", className = "" }: TopPickBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-200 ${className}`}
    >
      <span aria-hidden="true">★</span>
      <span>{label}</span>
    </span>
  );
}
