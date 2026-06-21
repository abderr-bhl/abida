import { Star } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm mb-4">
      <Star size={14} fill="currentColor" />
      Top Pick
    </div>
  );
}
