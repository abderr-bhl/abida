'use client';

import React, { useState, useTransition } from 'react';
import { ContentTask } from '@/lib/automation/benchmark';
import { triggerBenchmarkAction, updateTaskStatusAction, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

interface TaskDashboardProps {
  initialTasks: ContentTask[];
}

export default function TaskDashboard({ initialTasks }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<ContentTask[]>(initialTasks);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [benchmarkMessage, setBenchmarkMessage] = useState<string | null>(null);

  const handleRunBenchmark = () => {
    setBenchmarkMessage('Running benchmarking system... Fetching competitor RSS feeds.');
    startTransition(async () => {
      const res = await triggerBenchmarkAction();
      if (res.success) {
        setBenchmarkMessage(`Success: Daily benchmark completed. Found and added ${res.count} new competitor tasks.`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setBenchmarkMessage(`Error: ${res.error || 'Failed to trigger benchmark.'}`);
      }
    });
  };

  const handleUpdateStatus = (taskId: string, status: ContentTask['status']) => {
    startTransition(async () => {
      const res = await updateTaskStatusAction(taskId, status);
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      } else {
        alert(`Failed to update status: ${res.error}`);
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  // Filter tasks
  const filteredTasks = filteredTasksList(tasks, filter, search);

  // Stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    approved: tasks.filter(t => t.status === 'Approved').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    dismissed: tasks.filter(t => t.status === 'Dismissed').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Competitor Benchmarking</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and benchmark USA competitors to identify content gaps and automate product tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors shadow-sm"
          >
            {isPending ? 'Processing...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-sm font-semibold rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Benchmark Message Area */}
      {benchmarkMessage && (
        <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium border border-blue-100 dark:border-blue-800/50 flex items-center justify-between">
          <span>{benchmarkMessage}</span>
          <button onClick={() => setBenchmarkMessage(null)} className="text-blue-500 hover:text-blue-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Tasks', value: stats.total, bg: 'bg-white dark:bg-gray-800', text: 'text-gray-900 dark:text-white' },
          { label: 'Pending Gaps', value: stats.pending, bg: 'bg-yellow-50 dark:bg-yellow-900/15', text: 'text-yellow-800 dark:text-yellow-400' },
          { label: 'Approved', value: stats.approved, bg: 'bg-green-50 dark:bg-green-900/15', text: 'text-green-800 dark:text-green-400' },
          { label: 'Completed', value: stats.completed, bg: 'bg-blue-50 dark:bg-blue-900/15', text: 'text-blue-800 dark:text-blue-400' },
          { label: 'Dismissed', value: stats.dismissed, bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400' },
        ].map((card, idx) => (
          <div key={idx} className={`${card.bg} p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'Approved', 'Completed', 'Dismissed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all border ${
                filter === status
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
          />
        </div>
      </div>

      {/* Tasks Table/List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filter === 'All' ? "Try running the benchmark to parse competitor feeds." : `No tasks with "${filter}" status.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-850">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50/55 dark:hover:bg-gray-800/10 transition-colors">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-2 flex-grow max-w-4xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                        task.sourceName === 'Wirecutter'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400'
                      }`}>
                        {task.sourceName}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                        task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        task.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        task.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(task.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{task.description}</p>
                    <div className="pt-1">
                      <a
                        href={sanitizeUrl(task.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        View Original Competitor Article
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:shrink-0">
                    {task.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'Approved')}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-xs transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'Dismissed')}
                          className="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 rounded-lg transition-colors"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                    {task.status === 'Approved' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'Completed')}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'Dismissed')}
                          className="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 rounded-lg transition-colors"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                    {(task.status === 'Completed' || task.status === 'Dismissed') && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'Pending')}
                        className="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 rounded-lg transition-colors"
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function filteredTasksList(tasks: ContentTask[], filter: string, search: string) {
  return tasks.filter(task => {
    const matchesFilter = filter === 'All' || task.status === filter;
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase()) ||
      task.sourceName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}
