'use client';

import { useTransition, useState } from 'react';
import { triggerBenchmark } from '@/app/admin/tasks/actions';

export default function RunBenchmarkButton() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClick = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await triggerBenchmark();
      setFeedback(res.message);
    });
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {isPending ? 'Benchmarking...' : 'Run Benchmark Now'}
      </button>
      {feedback && (
        <p className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
          {feedback}
        </p>
      )}
    </div>
  );
}
