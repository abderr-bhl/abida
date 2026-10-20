'use client';

import { useState, useTransition } from 'react';
import { triggerBenchmark } from './actions';
import { RefreshCw } from 'lucide-react';

export default function RunBenchmarkButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await triggerBenchmark();
      setMessage(res.message);
    });
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
      >
        <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
        {isPending ? 'Benchmarking Competitors...' : 'Run Benchmark Now'}
      </button>
      {message && (
        <span className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
          {message}
        </span>
      )}
    </div>
  );
}
