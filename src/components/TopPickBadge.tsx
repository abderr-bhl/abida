export default function TopPickBadge({
  text = 'TOP PICK',
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800 ${className}`}
    >
      {text}
    </span>
  );
}
