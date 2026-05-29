import React from 'react';

const TopPickBadge: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 bg-[#FF9900] text-gray-900 px-4 py-1 rounded-br-lg font-bold text-xs uppercase tracking-widest z-10 flex items-center shadow-md">
      <span className="mr-1">🏆</span> Top Pick
    </div>
  );
};

export default TopPickBadge;
