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
      className={`inline-block bg-[#FF9900] hover:bg-[#e68a00] text-white font-bold py-3 px-8 rounded-lg transition-colors text-center shadow-sm ${className}`}
    >
      {text}
    </a>
  );
}
