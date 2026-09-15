import React from 'react';
import { sanitizeUrl } from '@/lib/sanitize';

interface AmazonButtonProps {
  url: string;
  label?: string;
  className?: string;
}

export default function AmazonButton({
  url,
  label = 'See on Amazon',
  className = '',
}: AmazonButtonProps) {
  const safeUrl = sanitizeUrl(url);

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] text-[#111827] hover:bg-[#e68a00] font-semibold px-4 py-2.5 rounded-md text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 shadow-sm ${className}`}
    >
      <span>{label}</span>
      <svg
        className="w-4 h-4 text-[#111827]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
