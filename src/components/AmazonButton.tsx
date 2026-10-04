import React from 'react';
import { ExternalLink } from 'lucide-react';
import { sanitizeUrl } from '@/lib/sanitize';

interface AmazonButtonProps {
  url: string;
  text?: string;
  className?: string;
}

export default function AmazonButton({
  url,
  text = 'View on Amazon',
  className = '',
}: AmazonButtonProps) {
  const safeUrl = sanitizeUrl(url);

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} (opens in a new tab)`}
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e68a00] text-[#111827] font-bold py-3 px-6 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${className}`}
    >
      <span>{text}</span>
      <ExternalLink className="w-4 h-4 text-[#111827]" aria-hidden="true" />
    </a>
  );
}
