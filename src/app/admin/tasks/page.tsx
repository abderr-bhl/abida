import { requireAuth } from '@/lib/auth';
import { Task, BenchmarkRecord } from '@/types';
import fs from 'fs';
import path from 'path';
import { triggerBenchmark, updateTaskStatus, logoutAction } from './actions';
import { RefreshCw, ExternalLink, CheckCircle, Clock, Trash2, LogOut } from 'lucide-react';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');
const BENCHMARK_FILE = path.join(process.cwd(), 'data', 'benchmark.json');

export default async function AdminTasksPage() {
  await requireAuth();

  let tasks: Task[] = [];
  let benchmarkRecord: BenchmarkRecord | null = null;

  if (fs.existsSync(TASKS_FILE)) {
    tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  }

  if (fs.existsSync(BENCHMARK_FILE)) {
    benchmarkRecord = JSON.parse(fs.readFileSync(BENCHMARK_FILE, 'utf-8'));
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage automated benchmarking tasks</p>
          </div>
          <div className="flex gap-4">
            <form action={triggerBenchmark}>
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={18} />
                Run Benchmark Now
              </button>
            </form>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </form>
          </div>
        </div>

        {benchmarkRecord && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-8 border border-gray-200 dark:border-gray-800 shadow-sm flex gap-8">
            <div>
              <p className="text-sm text-gray-500">Last Run</p>
              <p className="font-semibold">{new Date(benchmarkRecord.lastRun).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Competitors Checked</p>
              <p className="font-semibold">{benchmarkRecord.competitorsChecked.join(', ')}</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Task</th>
                <th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No tasks generated yet.</td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-primary hover:underline">
                        <a href={task.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          {task.competitor} <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {task.status !== 'completed' && (
                          <form action={updateTaskStatus.bind(null, task.id, 'completed')}>
                            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Mark as completed">
                              <CheckCircle size={18} />
                            </button>
                          </form>
                        )}
                        {task.status === 'pending' && (
                          <form action={updateTaskStatus.bind(null, task.id, 'in-progress')}>
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Start task">
                              <Clock size={18} />
                            </button>
                          </form>
                        )}
                        <form action={updateTaskStatus.bind(null, task.id, 'archived')}>
                          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Archive">
                            <Trash2 size={18} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
