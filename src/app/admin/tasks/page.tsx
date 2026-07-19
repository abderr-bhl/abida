'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import {
  triggerBenchmarkAction,
  fetchTasksAction,
  fetchRecordsAction,
  updateTaskStatusAction
} from './actions';
import { logoutAdmin } from '../login/actions';
import { Task, BenchmarkRecord } from '@/types';

// Helper to sanitize URLs against XSS and ensure link integrity
function sanitizeUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Return empty or hash if invalid url string
  }
  return '#';
}

export default function AdminTasksDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [records, setRecords] = useState<BenchmarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed' | 'Ignored'>('All');
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(async () => {
    try {
      const fetchedTasks = await fetchTasksAction();
      const fetchedRecords = await fetchRecordsAction();
      setTasks(fetchedTasks);
      setRecords(fetchedRecords);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Avoid React cascading render lint warnings with a deferred execution
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleRunBenchmark = () => {
    startTransition(async () => {
      const res = await triggerBenchmarkAction();
      if (res.success) {
        await loadData();
      }
    });
  };

  const handleStatusUpdate = async (taskId: string, status: 'Pending' | 'Completed' | 'Ignored') => {
    const res = await updateTaskStatusAction(taskId, status);
    if (res.success) {
      await loadData();
    }
  };

  const handleLogout = () => {
    logoutAdmin();
  };

  const filteredTasks = tasks.filter((t) => filter === 'All' || t.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Admin Task Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor competitive intelligence benchmarks and automated task generation.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading intelligence data...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tasks List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Generated Content Tasks ({filteredTasks.length})
              </span>
              <div className="flex gap-1.5">
                {(['All', 'Pending', 'Completed', 'Ignored'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFilter(opt)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                      filter === opt
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center text-gray-500">
                No tasks available. Use &quot;Run Benchmark Now&quot; to fetch competitive actions!
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => {
                  const safeUrl = sanitizeUrl(task.competitorUrl);
                  return (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between gap-4 items-start"
                    >
                      <div className="space-y-2 max-w-xl">
                        <div className="flex gap-2 items-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            task.source === 'Wirecutter'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-purple-100 text-purple-900'
                          }`}>
                            {task.source}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            task.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-900'
                              : task.status === 'Completed'
                              ? 'bg-green-100 text-green-900'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {task.description}
                        </p>
                        {safeUrl !== '#' && (
                          <div className="pt-1">
                            <a
                              href={safeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View competitor link: ${task.title} (opens in a new tab)`}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            >
                              <span>View Competitor Article</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleStatusUpdate(task.id, 'Completed')}
                          className="flex-1 sm:flex-initial text-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(task.id, 'Ignored')}
                          className="flex-1 sm:flex-initial text-center px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Benchmark Execution Records Sidepanel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Execution Logs
              </h2>
              {records.length === 0 ? (
                <p className="text-sm text-gray-500">No executions recorded yet.</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {records.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-850 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-500">
                          {new Date(rec.runAt).toLocaleTimeString()}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          rec.status === 'Success'
                            ? 'bg-green-100 text-green-900'
                            : 'bg-yellow-100 text-yellow-900'
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-350">{rec.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
