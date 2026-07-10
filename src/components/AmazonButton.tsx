import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      className={cn(
        "inline-flex items-center justify-center space-x-2 bg-[#FF9900] hover:bg-[#e68a00] text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors text-center shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF9900] outline-none",
        className
      )}
    >
      <span>{text}</span>
      <ExternalLink size={18} aria-hidden="true" />
    </a>
  );
}
