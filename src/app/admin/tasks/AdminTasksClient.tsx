'use client';

import { useState, useTransition } from 'react';
import { ExternalLink, LogOut, Play, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Task } from '@/types';
import { triggerBenchmarkAction, updateTaskStatusAction, logoutAction } from './actions';

interface Props {
  initialTasks: Task[];
}

export default function AdminTasksClient({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'ignored'>('all');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const sanitizeUrl = (urlString: string): string => {
    try {
      const parsed = new URL(urlString);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.href;
      }
    } catch {}
    return '#';
  };

  const handleTriggerBenchmark = () => {
    startTransition(async () => {
      setMessage('Running competitive benchmark...');
      const result = await triggerBenchmarkAction();
      if (result.success) {
        setMessage(`Benchmark run completed successfully! Created ${result.tasksCreatedCount} new tasks.`);
        window.location.reload();
      } else {
        setMessage(`Benchmark failed: ${result.error || 'Unknown error'}`);
      }
    });
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    const result = await updateTaskStatusAction(taskId, newStatus);
    if (result.success) {
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } else {
      alert(`Error: ${result.error || 'Failed to update status'}`);
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage competitor benchmark insights and actions.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleTriggerBenchmark}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
          >
            <Play className="w-4 h-4" />
            Run Benchmark Now
          </button>
          <button
            onClick={() => logoutAction()}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2.5 px-5 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 outline-none"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300">
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'pending', 'completed', 'ignored'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks found matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Competitor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTasks.map(task => {
                  const safeUrl = sanitizeUrl(task.sourceUrl);
                  return (
                    <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          task.competitor === 'Wirecutter'
                            ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {task.competitor}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{task.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mt-1">{task.description}</div>
                        <div className="mt-2">
                          <a
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View competitor article: ${task.title} (opens in a new tab)`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 outline-none rounded"
                          >
                            Source Link
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          task.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-950 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : task.status === 'completed'
                            ? 'bg-green-100 text-green-950 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-950 dark:bg-gray-800/50 dark:text-gray-400'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'completed')}
                              title="Mark as completed"
                              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-green-500 outline-none"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {task.status !== 'ignored' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'ignored')}
                              title="Ignore task"
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 outline-none"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {task.status !== 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'pending')}
                              title="Reset to pending"
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-500 outline-none"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
}
