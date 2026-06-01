export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center bg-accent text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-4 shadow-sm">
      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M2.166 4.9L9.03 9.069a2.25 2.25 0 002.256 0l6.863-4.17a.225.225 0 01.348.194v9.49a2.25 2.25 0 01-1.123 1.947l-7.247 4.4a2.25 2.25 0 01-2.259 0l-7.247-4.4A2.25 2.25 0 011.5 14.613V5.094a.225.225 0 01.348-.194z" clipRule="evenodd" />
      </svg>
      Top Pick
    </div>
  );
}
