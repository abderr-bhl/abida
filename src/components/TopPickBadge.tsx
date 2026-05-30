import React from 'react';

export const TopPickBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center bg-black text-white text-xs font-bold uppercase tracking-wider px-3 py-1 mb-4">
      <span className="mr-2">★</span>
      Top Pick
    </div>
  );
};

export default TopPickBadge;
