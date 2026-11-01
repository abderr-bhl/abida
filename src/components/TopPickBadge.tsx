export default function TopPickBadge({ label = "Wirecutter & ReviewGuid Top Pick" }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300 shadow-xs mb-3">
      <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
      <span>{label}</span>
    </div>
  );
}
