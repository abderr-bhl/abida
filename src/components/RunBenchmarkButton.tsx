'use client';

import { useTransition, useState } from 'react';
import { triggerBenchmark } from '@/app/admin/tasks/actions';

export default function RunBenchmarkButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleRun = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await triggerBenchmark();
      if (res.success) {
        setMessage(`Benchmark complete: ${res.added} new task(s) added.`);
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <button
        onClick={handleRun}
        disabled={isPending}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {isPending ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Running Competitive Benchmark...
          </>
        ) : (
          'Run Benchmark Now'
        )}
      </button>
      {message && (
        <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-3 py-1.5 rounded border border-green-200 dark:border-green-800">
          {message}
        </span>
      )}
    </div>
  );
}
