'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '@/types';
import { RefreshCw, ExternalLink, CheckCircle, Clock, Play } from 'lucide-react';
import { getTasks, updateTaskStatus, runBenchmark } from './actions';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      if (data.length === 0) {
        // Could be unauthorized or truly empty
      }
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      setAuthorized(false);
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

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    try {
      await runBenchmark();
      await fetchTasks();
    } catch (error) {
      console.error('Benchmark failed', error);
      alert('Benchmark failed. Are you authorized?');
    } finally {
      setRunningBenchmark(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, status);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (error) {
      console.error('Update status failed', error);
      alert('Update failed');
    }
  };

  if (!authorized) return <div className="p-8 text-center text-red-600">Unauthorized. Admin access only.</div>;
  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Task Dashboard</h1>
        <button
          onClick={handleRunBenchmark}
          disabled={runningBenchmark}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={runningBenchmark ? 'animate-spin' : ''} size={20} />
          {runningBenchmark ? 'Running Benchmark...' : 'Run Benchmark Now'}
        </button>
      </div>

      <div className="grid gap-6">
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic">No tasks generated yet. Run a benchmark to find competitor updates.</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white border rounded-lg p-6 shadow-sm flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    task.competitor === 'Wirecutter' ? 'bg-black text-white' : 'bg-red-600 text-white'
                  }`}>
                    {task.competitor}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                <p className="text-gray-600 mb-4">{task.description}</p>
                <a
                  href={task.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  View source <ExternalLink size={14} />
                </a>
              </div>

              <div className="flex flex-col justify-center gap-2 min-w-[150px]">
                <div className="flex items-center gap-2 mb-2">
                  {task.status === 'pending' && <Clock className="text-amber-500" size={18} />}
                  {task.status === 'in_progress' && <Play className="text-blue-500" size={18} />}
                  {task.status === 'completed' && <CheckCircle className="text-green-500" size={18} />}
                  <span className="capitalize font-medium">{task.status.replace('_', ' ')}</span>
                </div>

                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                  className="border rounded p-1 text-sm bg-gray-50 cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
