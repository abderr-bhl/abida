import React from 'react';
import { getStoredTasks } from '@/lib/automation/benchmark';
import { logoutAction } from '@/app/admin/login/actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import RunBenchmarkButton from '@/components/RunBenchmarkButton';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = getStoredTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Competitor Tasks</h1>
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              US Market
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated content gap tracking from competitors like Wirecutter and RTINGS.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <RunBenchmarkButton />
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No tasks generated yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Click &quot;Run Benchmark Now&quot; above to scan competitor feeds and generate content tasks.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {tasks.length} Total Task{tasks.length > 1 ? 's' : ''}
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => (
              <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                        {task.competitor}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                      <span>Created: {new Date(task.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <a
                        href={sanitizeUrl(task.competitorUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        View Original Article
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 00-2-2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
