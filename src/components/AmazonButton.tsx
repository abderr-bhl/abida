import React from 'react';
import { ExternalLink } from 'lucide-react';
import { sanitizeUrl } from '@/lib/sanitize';

interface AmazonButtonProps {
  url: string;
  text?: string;
  className?: string;
}

export default function AmazonButton({ url, text = 'Check Price on Amazon', className = '' }: AmazonButtonProps) {
  const safeUrl = sanitizeUrl(url);

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} (opens in a new tab)`}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF9900] text-[#111827] font-bold text-sm rounded-lg hover:bg-[#e68a00] active:bg-[#cc7a00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9900] transition-colors shadow-sm ${className}`}
    >
      <span>{text}</span>
      <ExternalLink className="w-4 h-4 flex-shrink-0" />
    </a>
  );
}
