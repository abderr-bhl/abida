import React from 'react';

interface AmazonButtonProps {
  url: string;
  text?: string;
  className?: string;
}

export default function AmazonButton({ url, text = "View on Amazon", className = "" }: AmazonButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} (opens in a new tab)`}
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e68a00] text-[#111827] font-bold py-3 px-8 rounded-lg transition-colors text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:ring-offset-2 ${className}`}
    >
      <span>{text}</span>
      <svg
        className="w-4 h-4 text-[#111827]"
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
          d="M13.5 10.5L21 3m0 0h-5.25M21 3v5.25M9 3H4.5a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 004.5 21h13.5A2.25 2.25 0 0021 18.75V14"
        />
      </svg>
    </a>
  );
}
