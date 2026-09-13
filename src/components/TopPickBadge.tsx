interface TopPickBadgeProps {
  label?: string;
  className?: string;
}

export default function TopPickBadge({ label = 'TOP PICK', className = '' }: TopPickBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300 shadow-xs ${className}`}
    >
      <span className="mr-1 text-orange-600 font-black">★</span>
      {label}
    </span>
  );
}
