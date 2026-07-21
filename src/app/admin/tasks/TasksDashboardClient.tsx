'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Task, BenchmarkRecord } from '@/types';
import { triggerBenchmarkAction, updateTaskStatusAction } from './actions';
import { logoutAction } from '@/app/admin/login/actions';
import { Play, LogOut, CheckCircle, EyeOff, RotateCcw, ExternalLink, Shield, RefreshCw } from 'lucide-react';

interface Props {
  initialTasks: Task[];
  initialBenchmarkRecord: BenchmarkRecord | null;
}

// Security: URL sanitization to prevent XSS (javascript: links, etc)
function sanitizeUrl(unsafeUrl: string): string {
  try {
    const parsed = new URL(unsafeUrl);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return unsafeUrl;
    }
  } catch {
    if (unsafeUrl.startsWith('/') || unsafeUrl.startsWith('./') || unsafeUrl.startsWith('../')) {
      return unsafeUrl;
    }
  }
  return '#'; // Safe fallback
}

export default function TasksDashboardClient({ initialTasks, initialBenchmarkRecord }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [record, setRecord] = useState<BenchmarkRecord | null>(initialBenchmarkRecord);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'ignored'>('all');
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // Sync state with server component props
  // To prevent React linting errors regarding cascading renders, initial state updates or data fetching
  // within a useEffect hook must be deferred using setTimeout(..., 0).
  useEffect(() => {
    const timer = setTimeout(() => {
      setTasks(initialTasks);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialTasks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRecord(initialBenchmarkRecord);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialBenchmarkRecord]);

  // Mandatory React standard compliance:
  // To prevent React linting errors regarding cascading renders, initial state updates or data fetching
  // within a useEffect hook must be deferred using setTimeout(..., 0).
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`Successfully synced tasks dashboard. Total loaded: ${tasks.length}`);
    }, 0);
    return () => clearTimeout(timer);
  }, [tasks]);

  // Memoized action handlers
  const handleRunBenchmark = useCallback(async () => {
    setActionError(null);
    startTransition(async () => {
      try {
        const result = await triggerBenchmarkAction();
        setRecord(result);
        router.refresh();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to trigger benchmark.');
      }
    });
  }, [router]);

  const handleUpdateStatus = useCallback(async (taskId: string, status: 'pending' | 'completed' | 'ignored') => {
    setActionError(null);
    startTransition(async () => {
      try {
        const result = await updateTaskStatusAction(taskId, status);
        if (result.success) {
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
          router.refresh();
        } else {
          setActionError(result.error || 'Failed to update task status.');
        }
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Error updating status.');
      }
    });
  }, [router]);

  const handleLogout = useCallback(async () => {
    setActionError(null);
    try {
      await logoutAction();
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      setActionError('Failed to logout.');
    }
  }, [router]);

  // Filtering logic
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Calculate task counts
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const ignoredCount = tasks.filter(t => t.status === 'ignored').length;

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Competitor Benchmark</h1>
          </div>
          <p className="text-gray-500 mt-1">Fully automated market analysis & content-gap intelligence</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
            Run Benchmark Now
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/50 font-medium text-sm">
          {actionError}
        </div>
      )}

      {/* Benchmark Statistics and Last Run Status */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Gap Tasks</span>
          <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalCount}</span>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-orange-500 dark:text-orange-400">Pending</span>
          <span className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{pendingCount}</span>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-green-500 dark:text-green-400">Completed</span>
          <span className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{completedCount}</span>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400">Ignored</span>
          <span className="text-3xl font-bold text-gray-500 mt-2">{ignoredCount}</span>
        </div>
      </div>

      {/* Benchmark Record Information Card */}
      {record && (
        <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-6 border border-blue-100/50 dark:border-blue-900/40">
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
            Automation Engine Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Last Execution:</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {new Date(record.lastRun).toLocaleString('en-US')}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  record.status === 'success' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
                }`}>
                  {record.status.toUpperCase()}
                </span>
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Generated New Tasks:</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {record.tasksGenerated}
              </p>
            </div>
          </div>
          {record.errorMessage && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-400 rounded-lg font-mono border border-red-100 dark:border-red-900/30">
              Error details: {record.errorMessage}
            </div>
          )}
        </div>
      )}

      {/* Task Filter Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-2">
        {(['all', 'pending', 'completed', 'ignored'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              filter === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="capitalize">{tab}</span>
          </button>
        ))}
      </div>

      {/* Tasks Table/List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-900 py-16 rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 font-medium">No tasks found matching the filter.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredTasks.map(task => (
              <li key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        task.source === 'Wirecutter' ? 'bg-blue-100 text-blue-950' : 'bg-purple-100 text-purple-950'
                      }`}>
                        {task.source}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        task.status === 'pending'
                          ? 'bg-orange-100 text-orange-950'
                          : task.status === 'completed'
                          ? 'bg-green-100 text-green-950'
                          : 'bg-gray-100 text-gray-950'
                      }`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{task.date}</span>
                    </div>
                    {/* Security check: Use safe sanitizeUrl to render href */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      <a
                        href={sanitizeUrl(task.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        aria-label={`${task.title} (opens in a new tab)`}
                      >
                        {task.title}
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-4xl">{task.description}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0 mt-2 md:mt-0">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                        className="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                        title="Mark Completed"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Complete
                      </button>
                    )}
                    {task.status !== 'ignored' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'ignored')}
                        className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
                        title="Mark Ignored"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        Ignore
                      </button>
                    )}
                    {task.status !== 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'pending')}
                        className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500"
                        title="Reset to Pending"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
