import React from 'react';
import { getTasks } from '@/lib/automation/benchmark';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { triggerBenchmark, deleteTaskAction } from './actions';
import { Play, Trash2, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Top Banner and Trigger Action */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Daily Benchmarking Summary
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitors Wirecutter and RTINGS to automatically spot US content gaps.
          </p>
        </div>
        <form action={triggerBenchmark}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Benchmark Now</span>
          </button>
        </form>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Benchmark Tasks</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{tasks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
            <AlertCircle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{inProgressCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-2">{completedCount}</p>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Content Strategy Tasks</h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No benchmarking tasks yet. Click &quot;Run Benchmark Now&quot; above to discover competitor content gaps.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider">
                  <th className="py-3 px-6 font-semibold">Title & Description</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map(task => {
                  const safeUrl = sanitizeUrl(task.url);

                  return (
                    <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 px-6 max-w-md">
                        <p className="font-bold text-gray-900 dark:text-white line-clamp-2">{task.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {task.source}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                        {task.category}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded uppercase ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                              : task.priority === 'medium'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">
                          {task.url && (
                            <a
                              href={safeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-primary transition-colors p-1"
                              title="View competitor source"
                              aria-label="View competitor source (opens in new tab)"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <form action={deleteTaskAction.bind(null, task.id)}>
                            <button
                              type="submit"
                              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                              title="Delete task"
                              aria-label="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
