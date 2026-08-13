import { sanitizeUrl } from '@/lib/sanitize';

interface AmazonButtonProps {
  url: string;
  text?: string;
  className?: string;
}

export default function AmazonButton({ url, text = "View on Amazon", className = "" }: AmazonButtonProps) {
  const sanitizedUrl = sanitizeUrl(url);

  return (
    <a
      href={sanitizedUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} (opens in a new tab)`}
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e68a00] text-[#111827] font-bold py-3 px-8 rounded-lg transition-colors text-center shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9900] focus:outline-none dark:focus:ring-offset-gray-900 ${className}`}
    >
      <span>{text}</span>
      <svg
        className="w-4 h-4 shrink-0 text-[#111827]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
        />
      </svg>
    </a>
  );
}
