import { Award } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-900 uppercase tracking-wider shadow-sm">
      <Award className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
      Top Pick
    </span>
  );
}
