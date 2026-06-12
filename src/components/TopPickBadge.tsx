import { Star } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-sm text-sm font-bold uppercase tracking-wider mb-4 shadow-sm">
      <Star className="w-4 h-4 mr-2 fill-current" />
      Top Pick
    </div>
  );
}
