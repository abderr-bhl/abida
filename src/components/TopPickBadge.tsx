import { Star } from 'lucide-react';

export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-sm font-bold shadow-sm">
      <Star className="w-4 h-4 mr-1 fill-white" />
      TOP PICK
    </div>
  );
}
