import React from 'react';

export default function TopPickBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-orange-100 text-orange-900 border border-orange-300 uppercase tracking-wider shadow-xs">
      <span className="text-orange-600 font-black text-sm">★</span> Top Pick
    </span>
  );
}
