'use client';

import { useState, useTransition } from 'react';
import { triggerBenchmarkAction } from '@/app/admin/tasks/actions';
import { RefreshCw, Zap } from 'lucide-react';

export default function RunBenchmarkButton() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRunBenchmark = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await triggerBenchmarkAction();
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 5000);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <button
        onClick={handleRunBenchmark}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold text-sm py-2.5 px-4 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Zap className="w-4 h-4 fill-current text-yellow-300" />
        )}
        {isPending ? 'Benchmarking Competitors...' : 'Run Benchmark Now'}
      </button>

      {feedback && (
        <span className="text-xs font-medium px-3 py-1.5 rounded-md bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-fade-in">
          {feedback}
        </span>
      )}
    </div>
  );
}
