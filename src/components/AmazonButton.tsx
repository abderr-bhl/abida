import React from 'react';
import { ExternalLink } from 'lucide-react';
import { sanitizeUrl } from '@/lib/sanitize';

interface AmazonButtonProps {
  url: string;
  text?: string;
  className?: string;
}

export function AmazonButton({ url, text = 'Check Price on Amazon', className = '' }: AmazonButtonProps) {
  const safeUrl = sanitizeUrl(url);

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} (opens in a new tab)`}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm hover:shadow-md ${className}`}
      style={{ backgroundColor: '#FF9900', color: '#111827' }}
    >
      <span>{text}</span>
      <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
    </a>
  );
}

export default AmazonButton;
