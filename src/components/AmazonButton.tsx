interface AmazonButtonProps {
  url: string;
  text?: string;
  className?: string;
}

import { ExternalLink } from 'lucide-react';

export default function AmazonButton({ url, text = "View on Amazon", className = "" }: AmazonButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center bg-[#FF9900] hover:bg-[#e68a00] text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors text-center shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${className}`}
      aria-label={`${text} (opens in a new tab)`}
    >
      {text}
      <ExternalLink className="ml-2 h-4 w-4" />
    </a>
  );
}
