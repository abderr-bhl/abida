import React from 'react';
import { ExternalLink } from 'lucide-react';
import { sanitizeUrl } from '@/lib/sanitize';

interface AmazonButtonProps {
  url: string;
  text?: string;
  className?: string;
}

export default function AmazonButton({ url, text = 'View on Amazon', className = '' }: AmazonButtonProps) {
  const safeUrl = sanitizeUrl(url);

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} (opens in a new tab)`}
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e68a00] focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors text-center shadow-sm ${className}`}
    >
      <span>{text}</span>
      <ExternalLink className="w-4 h-4 text-gray-900" aria-hidden="true" />
    </a>
  );
}
