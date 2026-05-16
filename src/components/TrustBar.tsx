export default function TrustBar() {
  const trustItems = [
    { label: '100% Independent', icon: '🔒' },
    { label: 'Lab Tested', icon: '🧪' },
    { label: 'We Buy Our Own Products', icon: '🛒' },
    { label: 'No Affiliate Bias', icon: '⚖️' },
  ];

  return (
    <div className="bg-secondary border-y border-gray-200 dark:bg-gray-800/50 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-6">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm font-medium text-secondary-foreground dark:text-gray-300">
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div className="hidden lg:block h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
          <a href="/about" className="text-sm font-bold text-primary dark:text-blue-400 hover:underline">
            About Our Testing Methods →
          </a>
        </div>
      </div>
    </div>
  );
}
