'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { fetchTasksAction, triggerBenchmarkAction, updateTaskStatusAction } from './actions';
import { logoutAction } from '../login/actions';
import { sanitizeUrl } from '@/lib/sanitize';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    fetchTasksAction()
      .then((data) => {
        setTasks(data);
      })
      .catch((err) => {
        console.error('Failed to load tasks:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Defer initial data load to prevent cascading re-render warnings
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleRunBenchmark = () => {
    startTransition(async () => {
      setNotification(null);
      try {
        const res = await triggerBenchmarkAction();
        if (res.success) {
          setNotification({
            message: `Benchmark completed! ${res.newTasksCount} new task(s) generated.`,
            type: 'success',
          });
          loadData();
        } else {
          setNotification({
            message: 'Benchmark finished with warnings/errors.',
            type: 'error',
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setNotification({
          message: `Failed to run benchmark: ${msg}`,
          type: 'error',
        });
      }
    });
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    startTransition(async () => {
      await updateTaskStatusAction(taskId, status);
      loadData();
    });
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'dismissed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Competitive Benchmarking & Automated Tasks
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Daily automated tasks generated from competitor RSS feeds (Wirecutter, RTINGS) to keep reviewguid.com aligned with US market leaders.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0060df] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-500">Loading benchmarking tasks...</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>Active Tasks</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {pendingTasks.length}
              </span>
            </h2>

            {pendingTasks.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
                No active tasks found. Click &quot;Run Benchmark Now&quot; to discover content opportunities from competitors.
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {task.source}
                          </span>
                          <span className="text-xs text-slate-500">
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{task.title}</h3>
                        <p className="text-sm text-slate-600">{task.description}</p>
                        {task.sourceUrl && (
                          <a
                            href={sanitizeUrl(task.sourceUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-medium text-blue-600 hover:underline gap-1 mt-1"
                          >
                            View Source Article
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          disabled={isPending}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          Mark Done
                        </button>
                        <button
                          onClick={() => handleStatusChange(task.id, 'dismissed')}
                          disabled={isPending}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>Completed / Dismissed</span>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {completedTasks.length}
                </span>
              </h2>

              <div className="grid gap-3 opacity-75">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase text-slate-500">{task.source}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            task.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 mt-1">{task.title}</p>
                    </div>
                    <button
                      onClick={() => handleStatusChange(task.id, 'pending')}
                      disabled={isPending}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Reopen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
