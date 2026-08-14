import React from 'react';

/**
 * TopPickBadge highlights the best recommended choices.
 * Uses high-contrast orange to meet strict accessibility/WCAG guidelines.
 */
export default function TopPickBadge() {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200 shadow-sm">
      ★ Top Pick
    </span>
  );
}
