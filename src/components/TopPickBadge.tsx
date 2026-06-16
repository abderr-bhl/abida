import { Award } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center bg-accent text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
      <Award className="w-4 h-4 mr-1" />
      Top Pick
    </div>
  );
}
