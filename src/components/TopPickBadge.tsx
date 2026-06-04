import React from 'react';

export default function TopPickBadge() {
  return (
    <div className="absolute -top-3 -left-3 z-10">
      <div className="bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-sm shadow-md flex items-center gap-2">
        <span className="text-yellow-300">★</span>
        Top Pick
      </div>
    </div>
  );
}
