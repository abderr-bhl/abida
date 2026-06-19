'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { ExternalLink, RefreshCw, Trash2, CheckCircle, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/tasks', {
        headers: {
          'Authorization': 'Bearer admin'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch {
      setError('An error occurred while fetching tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const triggerBenchmark = async () => {
    setTriggering(true);
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin'
        },
        body: JSON.stringify({ action: 'trigger_benchmark' })
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      } else {
        alert('Failed to trigger benchmark');
      }
    } catch {
      alert('Error triggering benchmark');
    } finally {
      setTriggering(false);
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin'
        },
        body: JSON.stringify({ id, updates: { status } })
      });
      if (response.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
      }
    } catch {
      alert('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin'
        },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch {
      alert('Failed to delete task');
    }
  };

  const sanitizeUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      if (['http:', 'https:'].includes(parsed.protocol)) {
        return url;
      }
    } catch {
      return '#';
    }
    return '#';
  };

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage automated competitive benchmarking tasks.</p>
        </div>
        <button
          onClick={triggerBenchmark}
          disabled={triggering}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <RefreshCw className={cn("w-4 h-4", triggering && "animate-spin")} />
          Run Benchmark Now
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-800">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {tasks.length === 0 ? (
            <li className="p-8 text-center text-gray-500">No tasks found. Run a benchmark to discover new content.</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        task.status === 'completed' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      )}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-400">{task.competitorName}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <a
                        href={sanitizeUrl(task.competitorUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View competitor article: ${task.title} (opens in a new tab)`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Competitor Article
                      </a>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status !== 'completed' ? (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        title="Mark as Completed"
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'pending')}
                        title="Mark as Pending"
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      title="Delete Task"
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
