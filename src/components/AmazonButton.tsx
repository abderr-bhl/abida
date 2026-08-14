import React from 'react';

interface AmazonButtonProps {
  url: string;
  text?: string;
  className?: string;
}

/**
 * Amazon Button designed for compliance with WCAG AA standard.
 * Uses Amazon brand orange background #FF9900 with high-contrast dark text #111827.
 * Includes a visual external link SVG icon, custom aria-label, and explicit focus states.
 */
export default function AmazonButton({ url, text = 'View on Amazon', className = '' }: AmazonButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} (opens in a new tab)`}
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e68a00] text-[#111827] font-bold py-3 px-8 rounded-lg transition-colors text-center shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 ${className}`}
    >
      <span>{text}</span>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
        />
      </svg>
    </a>
  );
}
