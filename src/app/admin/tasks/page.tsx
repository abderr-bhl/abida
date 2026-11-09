import React from 'react';
import { getStoredTasks } from '@/lib/automation/benchmark';
import { runBenchmarkAction, logoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { RefreshCw, ExternalLink, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = await getStoredTasks();

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
              <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Admin
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            Competitor Benchmark & Content Engine
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Automated monitoring of US review giants (Wirecutter, RTINGS) to generate gap-filling articles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={runBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors"
            >
              Log Out
            </button>
          </form>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pending Tasks</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-2">{pendingCount}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-full text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">In Progress</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">{inProgressCount}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-full text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Completed</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">{completedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-full text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Automated Action Items ({tasks.length})
          </h2>
          <span className="text-xs text-gray-500">
            Updates automatically via daily cron at 05:00 UTC
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No tasks currently generated. Click &ldquo;Run Benchmark Now&rdquo; to analyze competitors.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase font-bold text-gray-700 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Task / Competitor Target</th>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Action</th>
                  <th scope="col" className="px-6 py-4">Detected</th>
                  <th scope="col" className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white text-base">
                        {task.title}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                          Source: {task.sourceCompetitor}
                        </span>
                        {task.sourceUrl && (
                          <a
                            href={sanitizeUrl(task.sourceUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span>View competitor source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {task.targetCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        {task.suggestedAction.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(task.detectedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
