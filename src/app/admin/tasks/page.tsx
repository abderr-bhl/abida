'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/admin/tasks', {
        headers: {
          'Authorization': 'Bearer admin'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.sort((a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use setTimeout to avoid cascading render lint error
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const updateStatus = async (taskId: string, status: string) => {
    await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'update_status', taskId, status })
    });
    fetchTasks();
  };

  const runBenchmark = async () => {
    setRunning(true);
    await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'trigger_benchmark' })
    });
    await fetchTasks();
    setRunning(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Strategy Tasks</h1>
        <button
          onClick={runBenchmark}
          disabled={running}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          <RefreshCw className={running ? 'animate-spin' : ''} size={18} />
          {running ? 'Benchmarking...' : 'Run Benchmark Now'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading tasks...</div>
      ) : (
        <div className="grid gap-4">
          {tasks.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
              No tasks yet. Run a benchmark to discover competitor content.
            </div>
          )}
          {tasks.map((task) => (
            <div key={task.id} className={`p-4 border rounded-lg shadow-sm bg-white flex justify-between items-center ${task.status !== 'pending' ? 'opacity-60' : ''}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                    {task.competitor}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{task.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                <a
                  href={task.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm flex items-center gap-1"
                >
                  View original article <ExternalLink size={14} />
                </a>
              </div>

              <div className="flex gap-2">
                {task.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => updateStatus(task.id, 'completed')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full border border-green-200"
                      title="Mark as completed"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => updateStatus(task.id, 'ignored')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full border border-red-200"
                      title="Ignore"
                    >
                      <XCircle size={20} />
                    </button>
                  </>
                ) : (
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {task.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
