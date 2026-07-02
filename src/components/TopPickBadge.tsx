import React from 'react';

export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-black uppercase tracking-widest mb-4 border border-orange-200">
      <span className="mr-2">🏆</span>
      Top Pick
    </div>
  );
}
