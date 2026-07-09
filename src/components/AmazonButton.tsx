import { ShoppingCart, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmazonButtonProps {
  url: string;
  text?: string;
  className?: string;
  showPrice?: boolean;
  price?: number;
}

export default function AmazonButton({
  url,
  text = "Check Price on Amazon",
  className,
  showPrice = false,
  price
}: AmazonButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} (opens in a new tab)`}
      className={cn(
        "btn-amazon group relative overflow-hidden",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500",
        className
      )}
    >
      <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
      <span className="flex flex-col items-start leading-tight">
        <span className="text-sm font-black uppercase tracking-tight">{text}</span>
        {showPrice && price && (
          <span className="text-[10px] opacity-80 font-medium">As of today: ${price}</span>
        )}
      </span>
      <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
    </a>
  );
}
