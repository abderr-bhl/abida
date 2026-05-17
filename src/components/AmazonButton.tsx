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
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e68a00] text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors text-center shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF9900] outline-none ${className}`}
    >
      <span>{text}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
          clipRule="evenodd"
        />
      </svg>
    </a>
  );
}
