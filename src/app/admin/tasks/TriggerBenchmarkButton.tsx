'use client';

import { useState } from 'react';
import { triggerBenchmark } from './actions';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TriggerBenchmarkButton() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleTrigger = async () => {
    setIsPending(true);
    try {
      await triggerBenchmark();
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Failed to trigger benchmark');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleTrigger}
      disabled={isPending}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
    </button>
  );
}
