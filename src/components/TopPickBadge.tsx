export default function TopPickBadge() {
  return (
    <div className="inline-flex items-center gap-1 bg-accent px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider mb-2">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M2.166 4.9L9.03 9.153l6.865-4.253L9.03 16.847 2.166 4.9z" clipRule="evenodd" />
      </svg>
      Top Pick
    </div>
  );
}
