'use client';

import { useState, useTransition } from 'react';
import { BenchmarkTask } from '@/types';
import { sanitizeUrl } from '@/lib/sanitize';
import {
  updateTaskStatusAction,
  triggerBenchmarkAction,
  logoutAction
} from './actions';

interface TasksDashboardProps {
  initialTasks: BenchmarkTask[];
}

export default function TasksDashboard({ initialTasks }: TasksDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [isPending, startTransition] = useTransition();

  const filteredTasks = initialTasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const handleStatusChange = (taskId: string, status: BenchmarkTask['status']) => {
    startTransition(async () => {
      await updateTaskStatusAction(taskId, status);
    });
  };

  const handleTriggerBenchmark = () => {
    startTransition(async () => {
      await triggerBenchmarkAction();
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Automated Competitive Benchmarking Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Daily content gap tasks generated from US competitor RSS feeds (Wirecutter, RTINGS).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerBenchmark}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
          >
            {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800 mb-6 pb-2 overflow-x-auto">
        {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {status.replace('_', ' ')}
            <span className="ml-2 text-xs bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full">
              {status === 'all'
                ? initialTasks.length
                : initialTasks.filter((t) => t.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <p className="text-gray-500 dark:text-gray-400">No tasks found matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {task.competitor}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : task.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                  {task.title}
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {task.description}
                </p>
                {task.sourceUrl && (
                  <a
                    href={sanitizeUrl(task.sourceUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-xs font-medium text-primary hover:underline gap-1"
                  >
                    View Source Competitor Article →
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 mr-2">Set Status:</span>
                <button
                  onClick={() => handleStatusChange(task.id, 'pending')}
                  disabled={isPending || task.status === 'pending'}
                  className="text-xs px-3 py-1.5 rounded-md font-medium border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange(task.id, 'in_progress')}
                  disabled={isPending || task.status === 'in_progress'}
                  className="text-xs px-3 py-1.5 rounded-md font-medium border border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 disabled:opacity-40 transition-colors"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange(task.id, 'completed')}
                  disabled={isPending || task.status === 'completed'}
                  className="text-xs px-3 py-1.5 rounded-md font-medium border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300 disabled:opacity-40 transition-colors"
                >
                  Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
