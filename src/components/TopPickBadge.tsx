import { Award } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-orange-200">
      <Award className="w-3.5 h-3.5" />
      Top Pick
    </div>
  );
}
