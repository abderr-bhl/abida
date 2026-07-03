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
      className={cn(
        "inline-flex items-center justify-center bg-[#FF9900] hover:bg-[#e68a00] text-gray-900 font-bold py-3 px-8 rounded-lg transition-all text-center shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF9900] outline-none",
        className
      )}
      aria-label={`${text} (opens in a new tab)`}
    >
      {text}
      <ExternalLink className="ml-2 w-4 h-4" aria-hidden="true" />
    </a>
  );
}
