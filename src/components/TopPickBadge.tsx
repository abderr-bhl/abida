import { Award } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm mb-4">
      <Award className="w-3.5 h-3.5" />
      <span>Top Pick</span>
    </div>
  );
}
