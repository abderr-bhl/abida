import { ExternalLink } from 'lucide-react';

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
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e68a00] text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none cursor-pointer ${className}`}
    >
      <span>{text}</span>
      <ExternalLink className="w-4 h-4 text-gray-900" aria-hidden="true" />
    </a>
  );
}
