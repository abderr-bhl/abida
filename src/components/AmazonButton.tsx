import { ExternalLink } from 'lucide-react';

interface AmazonButtonProps {
  url: string;
  text?: string;
  className?: string;
}

/**
 * AmazonButton component with improved accessibility and contrast.
 * Uses dark text on Amazon orange (#FF9900) to meet WCAG AA standards.
 */
export default function AmazonButton({ url, text = "View on Amazon", className = "" }: AmazonButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#FFB74D] text-gray-900 font-bold py-3 px-8 rounded-lg transition-all text-center shadow-md focus-visible:ring-4 focus-visible:ring-amber-500 outline-none ${className}`}
      aria-label={`${text} (opens in a new tab)`}
    >
      <span>{text}</span>
      <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
    </a>
  );
}
