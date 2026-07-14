'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { fetchTasksAction, updateTaskStatusAction, triggerBenchmarkAction } from './actions';
import { RefreshCw, ExternalLink, CheckCircle, Clock, Play } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTasksAction();
      setTasks(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Avoid cascading renders by using a timeout if needed, but here we just need to call it once on mount
    const timer = setTimeout(() => {
      loadTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const handleStatusUpdate = async (taskId: string, status: Task['status']) => {
    await updateTaskStatusAction(taskId, status);
    loadTasks();
  };

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      await triggerBenchmarkAction();
      await loadTasks();
    } catch (error) {
      console.error('Failed to run benchmark:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in-progress': return <Play className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automated Benchmarking Tasks</h1>
          <p className="text-gray-600 mt-1">Monitor and manage content tasks from US competitors.</p>
        </div>
        <button
          onClick={handleRunBenchmark}
          disabled={isRunning}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running Benchmark...' : 'Run Benchmark Now'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center border border-gray-200">
          <p className="text-gray-500">No tasks found. Run a benchmark to discover new content from competitors.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.competitor === 'Wirecutter' ? 'bg-black text-white' : 'bg-red-600 text-white'
                      }`}>
                        {task.competitor}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                        {getStatusIcon(task.status)}
                        <span className="capitalize">{task.status.replace('-', ' ')}</span>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusUpdate(task.id, e.target.value as Task['status'])}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="text-sm text-gray-500 italic">
                        {task.description}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <a
                        href={task.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Found on: {new Date(task.createdAt).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
