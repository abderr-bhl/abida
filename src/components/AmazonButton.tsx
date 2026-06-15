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
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#FFB13B] text-gray-900 font-bold py-3 px-8 rounded-lg transition-all text-center shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none ${className}`}
    >
      {text}
      <ExternalLink className="w-5 h-5" />
    </a>
  );
}
