import React from 'react';

export default function TopPickBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-orange-100 text-orange-900 border border-orange-200 uppercase tracking-wider shadow-sm">
      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
      Top Pick
    </span>
  );
}
