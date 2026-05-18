import React from 'react';

const TopPickBadge = () => {
  return (
    <div className="inline-flex items-center bg-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm mb-4">
      <span className="mr-1">🏆</span> Top Pick
    </div>
  );
};

export default TopPickBadge;
