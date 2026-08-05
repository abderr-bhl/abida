import React from 'react';
import Link from 'next/link';
import { readTasks, readBenchmarkStatus } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateTaskStatus, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = readTasks();
  const statusRecord = readBenchmarkStatus();

  // Sort tasks: pending first, then completed, then ignored, then by date descending
  const sortedTasks = [...tasks].sort((a, b) => {
    const statusOrder = { pending: 0, completed: 1, ignored: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 mb-8 gap-4">
        <div>
          <nav className="flex mb-2" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Admin Dashboard</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Competitor Benchmarking Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Identify content gaps by automatically scanning top US affiliate platforms (Wirecutter and RTINGS) daily.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      {/* Main Grid: Status & Manual Trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* System Status Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 col-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daily Automation Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Last Automated Run</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 block mt-1">
                {statusRecord ? new Date(statusRecord.lastRun).toLocaleString() : 'Never Run'}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Cron Run Result</span>
              <span className="inline-flex items-center gap-1.5 mt-2">
                <span className={`h-2.5 w-2.5 rounded-full ${statusRecord?.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase">
                  {statusRecord ? statusRecord.status : 'Unknown'}
                </span>
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded text-xs border border-blue-100 dark:border-blue-900/30">
            <strong>System Information:</strong> Daily sync checks NYT Wirecutter and RTINGS XML feeds at 05:00 UTC (&apos;0 5 * * *&apos; scheduled in Vercel).
          </div>
        </div>

        {/* Manual Benchmarking Trigger Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Manual Sync</h2>
            <p className="text-sm text-gray-500 mb-4">
              Force-trigger an immediate scan of RSS competitor feeds to detect any new reviews or buyer guides.
            </p>
          </div>
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-blue-700 text-white font-bold text-center transition-colors shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
            >
              Run Benchmark Now
            </button>
          </form>
        </div>
      </div>

      {/* Task List Section */}
      <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Benchmark Content Gap Tasks</h2>
          <p className="text-sm text-gray-500">
            Below are identified reviews/articles published by competitors. Use this data to write corresponding guides or reviews for USA audiences.
          </p>
        </div>

        {sortedTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No competitor tasks identified. Click &quot;Run Benchmark Now&quot; to fetch task gaps.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4">Task Information</th>
                  <th className="px-6 py-4">Competitor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {sortedTasks.map((task) => {
                  const safeSourceUrl = sanitizeUrl(task.sourceUrl);

                  // Bind status updates to Server Actions
                  const markCompleted = updateTaskStatus.bind(null, task.id, 'completed');
                  const markIgnored = updateTaskStatus.bind(null, task.id, 'ignored');
                  const markPending = updateTaskStatus.bind(null, task.id, 'pending');

                  return (
                    <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-4 max-w-lg">
                        <div className="font-bold text-gray-900 dark:text-white">{task.title}</div>
                        <div className="text-gray-500 text-xs mt-1 leading-relaxed">{task.description}</div>
                        <div className="mt-2 flex items-center gap-4 text-xs">
                          {safeSourceUrl ? (
                            <a
                              href={safeSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                            >
                              Source Article
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-red-500 italic">Insecure Link Bypassed</span>
                          )}
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-400">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          task.competitor === 'Wirecutter'
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {task.competitor}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          task.status === 'completed'
                            ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/50'
                            : task.status === 'ignored'
                            ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                            : 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900/50'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            task.status === 'completed' ? 'bg-green-600' : task.status === 'ignored' ? 'bg-gray-500' : 'bg-yellow-500'
                          }`} />
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {task.status !== 'completed' && (
                            <form action={markCompleted}>
                              <button
                                type="submit"
                                className="px-3 py-1.5 text-xs font-bold bg-green-500 hover:bg-green-600 text-white rounded transition-colors cursor-pointer"
                              >
                                Complete
                              </button>
                            </form>
                          )}
                          {task.status !== 'ignored' && (
                            <form action={markIgnored}>
                              <button
                                type="submit"
                                className="px-3 py-1.5 text-xs font-bold bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors cursor-pointer"
                              >
                                Ignore
                              </button>
                            </form>
                          )}
                          {(task.status === 'completed' || task.status === 'ignored') && (
                            <form action={markPending}>
                              <button
                                type="submit"
                                className="px-3 py-1.5 text-xs font-bold bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors cursor-pointer"
                              >
                                Reset
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
