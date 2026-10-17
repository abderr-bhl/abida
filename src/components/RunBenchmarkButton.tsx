'use client';

import { useState, useTransition } from 'react';
import { triggerBenchmark } from '@/app/admin/tasks/actions';

export default function RunBenchmarkButton() {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const handleClick = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await triggerBenchmark();
      setMsg(res.message);
      setTimeout(() => setMsg(null), 4000);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
      </button>
      {msg && <span className="text-xs text-green-600 dark:text-green-400">{msg}</span>}
    </div>
  );
}
