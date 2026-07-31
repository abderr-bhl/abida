'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import {
  triggerBenchmarkAction,
  updateTaskStatusAction,
  logoutAdminAction
} from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

interface Props {
  initialTasks: Task[];
}

export default function TasksDashboard({ initialTasks }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [competitorFilter, setCompetitorFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    // Defer state update to prevent cascading render linting errors
    const timer = setTimeout(() => {
      setTasks(initialTasks);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialTasks]);

  const handleRunBenchmark = () => {
    setActionMessage(null);
    startTransition(async () => {
      const res = await triggerBenchmarkAction();
      if (res.error) {
        setActionMessage(`Error: ${res.error}`);
      } else {
        setActionMessage(`Successfully generated ${res.tasksGenerated || 0} tasks!`);
        router.refresh();
      }
    });
  };

  const handleUpdateStatus = (taskId: string, newStatus: 'pending' | 'completed' | 'ignored') => {
    setActionMessage(null);
    startTransition(async () => {
      const res = await updateTaskStatusAction(taskId, newStatus);
      if (res.error) {
        setActionMessage(`Error: ${res.error}`);
      } else {
        setActionMessage('Task status updated successfully.');
        router.refresh();
      }
    });
  };

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push('/admin/login');
  };

  const filteredTasks = tasks.filter(task => {
    const matchStatus = statusFilter === 'all' ? true : task.status === statusFilter;
    const matchCompetitor = competitorFilter === 'all' ? true : task.competitor === competitorFilter;
    return matchStatus && matchCompetitor;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-200 pb-6 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage competitor benchmarking tasks & content gaps</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary outline-none"
          >
            {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer text-sm focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 outline-none"
          >
            Log Out
          </button>
        </div>
      </header>

      {actionMessage && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
          actionMessage.startsWith('Error')
            ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900'
            : 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900'
        }`}>
          {actionMessage}
        </div>
      )}

      {/* Filters */}
      <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Filters</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="ignored">Ignored</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="competitorFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Competitor Source
            </label>
            <select
              id="competitorFilter"
              value={competitorFilter}
              onChange={(e) => setCompetitorFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="all">All Competitors</option>
              <option value="Wirecutter">Wirecutter</option>
              <option value="RTINGS">RTINGS</option>
            </select>
          </div>
        </div>
      </section>

      {/* Tasks List */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generated Tasks ({filteredTasks.length})</h2>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No tasks found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Task Title & Source URL
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTasks.map((task) => {
                  const sanitizedUrl = sanitizeUrl(task.sourceUrl);
                  return (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{task.title}</div>
                        <div className="text-sm text-gray-500 mt-1 max-w-lg">{task.description}</div>
                        <div className="mt-2">
                          <a
                            href={sanitizedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-xs inline-flex items-center gap-1 focus:ring-2 focus:ring-primary outline-none"
                            aria-label={`View original competitor article at ${task.competitor} (opens in a new tab)`}
                          >
                            View Competitor Article
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.competitor === 'Wirecutter'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                        }`}>
                          {task.competitor}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(task.createdAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                            : task.status === 'ignored'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300'
                        }`}>
                          {task.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'completed')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 cursor-pointer font-semibold text-xs py-1 px-2 border border-green-200 dark:border-green-900 rounded-md hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          {task.status !== 'ignored' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'ignored')}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer font-semibold text-xs py-1 px-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              Ignore
                            </button>
                          )}
                          {task.status !== 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'pending')}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 cursor-pointer font-semibold text-xs py-1 px-2 border border-yellow-200 dark:border-yellow-900 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-colors"
                            >
                              Reset
                            </button>
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
