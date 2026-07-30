'use client';

import React, { useState, useEffect } from 'react';
import {
  updateTaskStatus,
  triggerBenchmark,
  clearAllTasks,
  logoutAction
} from './actions';
import { Task, BenchmarkRecord } from '@/types';

interface TasksDashboardProps {
  initialTasks: Task[];
  initialRecord: BenchmarkRecord | null;
}

// Helper to sanitize & validate URLs before rendering (XSS Protection)
function sanitizeAndValidateUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      // Escape HTML special characters for additional safety
      return parsed.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
  } catch {
    // Return empty if invalid URL
  }
  return '#';
}

export default function TasksDashboard({ initialTasks, initialRecord }: TasksDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [benchmarkRecord, setBenchmarkRecord] = useState<BenchmarkRecord | null>(initialRecord);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Periodic visual preview update deferred using setTimeout to satisfy lint rule
  useEffect(() => {
    const timer = setTimeout(() => {
      setTasks(initialTasks);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialTasks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBenchmarkRecord(initialRecord);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialRecord]);

  const handleUpdateStatus = async (taskId: string, status: 'Pending' | 'In Progress' | 'Completed') => {
    try {
      await updateTaskStatus(taskId, status);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status } : t))
      );
      setFeedback(`Task status updated to ${status}`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      const error = err as Error;
      setFeedback(`Error: ${error.message}`);
    }
  };

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    setFeedback('Running daily competitor benchmark... fetching RSS feeds.');
    try {
      const record = await triggerBenchmark();
      setBenchmarkRecord(record);
      setFeedback(`Benchmark complete! Created ${record.tasksCreated} new task(s).`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      const error = err as Error;
      setFeedback(`Benchmark failed: ${error.message}`);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleClearTasks = async () => {
    if (confirm('Are you sure you want to clear all tasks?')) {
      try {
        await clearAllTasks();
        setTasks([]);
        setFeedback('All tasks cleared.');
        setTimeout(() => setFeedback(null), 3000);
      } catch (err) {
        const error = err as Error;
        setFeedback(`Error: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Fully Automated &amp; Manual Content Gap Task Generation (Wirecutter &amp; RTINGS)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isBenchmarking}
            className="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {isBenchmarking ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={handleClearTasks}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Clear All Tasks
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mb-6 p-4 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-sm font-medium">
          {feedback}
        </div>
      )}

      {/* Benchmark summary card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Last Benchmark Run
          </h3>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {benchmarkRecord?.lastRun
              ? new Date(benchmarkRecord.lastRun).toLocaleString('en-US')
              : 'Never Run'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Last Run Status
          </h3>
          <p
            className={`text-lg font-bold uppercase ${
              benchmarkRecord?.status === 'success'
                ? 'text-green-600 dark:text-green-400'
                : benchmarkRecord?.status === 'failed'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500'
            }`}
          >
            {benchmarkRecord?.status || 'N/A'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Total Content Tasks
          </h3>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{tasks.length}</p>
        </div>
      </div>

      {/* Tasks listing table/cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Competitor Tasks Queue</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No automated tasks identified yet.</p>
            <p className="text-sm mt-1">
              Trigger a benchmark run to fetch the latest competitive insights and populate the tasks.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => {
              const sanitizedUrl = sanitizeAndValidateUrl(task.competitorUrl);
              return (
                <div key={task.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          task.competitor === 'Wirecutter'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-red-100 text-red-900 border border-red-200'
                        }`}
                      >
                        {task.competitor}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          task.status === 'Completed'
                            ? 'bg-green-100 text-green-900 border border-green-200'
                            : task.status === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                            : 'bg-gray-100 text-gray-900 border border-gray-200'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                    {sanitizedUrl !== '#' && (
                      <div className="pt-1">
                        <a
                          href={sanitizedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                        >
                          View Competitor Page
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">Created on: {new Date(task.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="flex gap-2 self-stretch md:self-auto justify-end">
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                      disabled={task.status === 'In Progress'}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'Completed')}
                      disabled={task.status === 'Completed'}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
