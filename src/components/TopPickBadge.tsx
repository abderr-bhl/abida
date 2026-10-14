interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({ label = "Top Pick", className = "" }: TopPickBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-900 border border-orange-300 shadow-xs ${className}`}
    >
      ★ {label}
    </span>
  );
}
