import React from 'react';
import { Star } from 'lucide-react';

export const TopPickBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center bg-[#FF9900] text-gray-900 px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider mb-2">
      <Star className="w-3 h-3 mr-1 fill-current" />
      Top Pick
    </div>
  );
};

export default TopPickBadge;
