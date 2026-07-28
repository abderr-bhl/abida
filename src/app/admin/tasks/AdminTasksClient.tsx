'use client';

import React, { useState, useTransition } from 'react';
import { Task, BenchmarkRecord } from '@/types';
import { triggerBenchmarkAction, updateTaskStatusAction, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/utils';

interface Props {
  initialTasks: Task[];
  initialRecords: BenchmarkRecord[];
}

export default function AdminTasksClient({ initialTasks, initialRecords }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [records] = useState<BenchmarkRecord[]>(initialRecords);
  const [filter, setFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [runningMsg, setRunningMsg] = useState<string | null>(null);

  // Trigger manual benchmark
  const handleRunBenchmark = () => {
    setRunningMsg('Running competitive benchmark...');
    startTransition(async () => {
      try {
        const result = await triggerBenchmarkAction();
        setRunningMsg(`Benchmark finished successfully! ${result.message}`);
        // Reload page to refresh the Server Component data, syncing with tasks.json perfectly
        window.location.reload();
      } catch (err) {
        setRunningMsg(`Error: ${err instanceof Error ? err.message : 'Benchmark run failed'}`);
      }
    });
  };

  // Update task status
  const handleUpdateStatus = (id: string, newStatus: Task['status']) => {
    startTransition(async () => {
      try {
        await updateTaskStatusAction(id, newStatus);
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      } catch (err) {
        alert(`Error updating task: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    });
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Competitor Benchmarking Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and process competitor content releases from Wirecutter and RTINGS.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Processing...' : 'Run Benchmark Now'}
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 font-semibold py-2.5 px-5 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary cursor-pointer"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {runningMsg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 p-4 rounded-lg text-sm font-medium">
          {runningMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Actionable Tasks</h2>
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'in_progress', 'completed', 'ignored'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    filter === status
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border border-gray-200 dark:bg-gray-900/50 dark:border-gray-800 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">No tasks found for the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {task.competitor}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                        {task.title}
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-900'
                          : task.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-900'
                          : task.status === 'ignored'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-red-100 text-red-900'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {task.description}
                  </p>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-400">
                      Published: {new Date(task.publishedDate).toLocaleDateString()}
                    </span>

                    <div className="flex flex-wrap gap-2 items-center">
                      <a
                        href={sanitizeUrl(task.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View competitor article: ${task.title} (opens in a new tab)`}
                        className="text-xs text-primary font-semibold hover:underline mr-2 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary p-1 rounded"
                      >
                        View Source
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </a>

                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as Task['status'])}
                        className="text-xs bg-gray-50 border border-gray-300 text-gray-700 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Update task status"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="ignored">Ignored</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Records Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Run History</h2>
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
            {records.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No benchmark runs recorded yet.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="border-b border-gray-200 dark:border-gray-800 pb-4 last:border-0 last:pb-0 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          record.status === 'success'
                            ? 'bg-green-100 text-green-900'
                            : 'bg-red-100 text-red-900'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {record.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
