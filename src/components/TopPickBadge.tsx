import { Award } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm mb-4">
      <Award size={14} />
      Top Pick
    </div>
  );
}
