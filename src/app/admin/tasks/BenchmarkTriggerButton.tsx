'use client';

import { useTransition } from 'react';
import { triggerBenchmark } from './actions';

export default function BenchmarkTriggerButton() {
  const [isPending, startTransition] = useTransition();

  const handleRun = () => {
    startTransition(async () => {
      await triggerBenchmark();
    });
  };

  return (
    <button
      onClick={handleRun}
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 shadow-sm"
    >
      <svg
        className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span>{isPending ? 'Benchmarking USA Competitors...' : 'Run Benchmark Now'}</span>
    </button>
  );
}
