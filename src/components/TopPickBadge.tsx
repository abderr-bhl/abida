import { Award } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200">
      <Award className="w-3.5 h-3.5" aria-hidden="true" />
      Top Pick
    </span>
  );
}
