import { Star } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-orange-200">
      <Star size={14} fill="currentColor" />
      Top Pick
    </div>
  );
}
