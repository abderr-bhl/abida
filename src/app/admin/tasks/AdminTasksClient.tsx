'use client';

import { useState, useTransition } from 'react';
import { Task } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import { triggerBenchmark, updateTaskStatus, logoutAction } from './actions';

interface AdminTasksPageClientProps {
  initialTasks: Task[];
}

export default function AdminTasksClient({ initialTasks }: AdminTasksPageClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleRunBenchmark = () => {
    startTransition(async () => {
      setMessage(null);
      try {
        const res = await triggerBenchmark();
        setMessage(`Benchmark run completed: ${res.added} new tasks created (${res.total} total).`);
        window.location.reload();
      } catch (err) {
        console.error('Failed to run benchmark:', err);
        setMessage('Error running benchmark.');
      }
    });
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold">Automated Competitor Task Manager</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitors competitors (Wirecutter, RTINGS) to generate US market product review tasks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunBenchmark}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm text-sm disabled:opacity-50 transition"
            >
              {isPending ? 'Processing...' : 'Run Benchmark Now'}
            </button>
            <form action={logoutAction}>
              <button
                type="submit"
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium px-4 py-2 rounded-md text-sm transition"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {message && (
          <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-md text-sm">
            {message}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-lg flex justify-between items-center">
            <span>Generated Competitor Tasks ({tasks.length})</span>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No tasks found. Click &quot;Run Benchmark Now&quot; to fetch competitor content.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => (
                <div key={task.id} className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white text-base">
                        {task.title}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        {task.competitor}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      <a
                        href={sanitizeUrl(task.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        View Source Competitor Article &rarr;
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                      disabled={isPending}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
