import fs from 'fs';
import path from 'path';
import { Task } from '@/types';
import { RefreshCw, ExternalLink, CheckCircle, Clock, Trash2, LogOut } from 'lucide-react';
import { updateTaskStatus, triggerBenchmark } from './actions';
import { logout } from '../login/actions';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function loadTasks(): Task[] {
  const DATA_FILE = path.join(process.cwd(), 'data/tasks.json');
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

export default function AdminTasksPage() {
  const tasks = loadTasks().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            Admin Task Dashboard
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Monitor and manage automated content tasks from competitor benchmarking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmark}>
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 shadow-sm transition-all active:scale-95">
              <RefreshCw size={16} />
              Run Benchmark Now
            </button>
          </form>
          <form action={logout}>
            <button className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all">
              <LogOut size={16} />
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pending Tasks</p>
          <p className="text-4xl font-black text-primary mt-2">{tasks.filter(t => t.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Completed</p>
          <p className="text-4xl font-black text-green-600 mt-2">{tasks.filter(t => t.status === 'completed').length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Discovered</p>
          <p className="text-4xl font-black text-gray-900 dark:text-white mt-2">{tasks.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Source</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Task Details</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                    No tasks found. Run a benchmark to discover new content opportunities.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-tighter",
                        task.competitor === 'Wirecutter' ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                      )}>
                        {task.competitor}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{task.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <a
                            href={task.sourceUrl}
                            target="_blank"
                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={10} /> View Original
                          </a>
                          <span className="text-[10px] text-gray-400">• discovered {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        task.status === 'pending' && "bg-amber-100 text-amber-800",
                        task.status === 'completed' && "bg-green-100 text-green-800",
                        task.status === 'ignored' && "bg-gray-100 text-gray-500"
                      )}>
                        {task.status === 'pending' && <Clock size={12} />}
                        {task.status === 'completed' && <CheckCircle size={12} />}
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {task.status === 'pending' && (
                          <form action={updateTaskStatus.bind(null, task.id, 'completed')}>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark as Completed">
                              <CheckCircle size={18} />
                            </button>
                          </form>
                        )}
                        <form action={updateTaskStatus.bind(null, task.id, 'ignored')}>
                          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Ignore Task">
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
