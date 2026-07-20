import { Trophy } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200 shadow-sm">
      <Trophy className="w-3.5 h-3.5 text-orange-800 animate-pulse" />
      Top Pick
    </span>
  );
}
