import { Sparkles } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 shadow-sm border border-orange-200 uppercase tracking-wider">
      <Sparkles className="w-3.5 h-3.5 text-orange-700" />
      <span>Top Pick</span>
    </div>
  );
}
