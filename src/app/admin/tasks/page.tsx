import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';
import { updateTaskStatus, runBenchmarkAction } from './actions';
import { logout } from '../login/actions';

async function getTasks(): Promise<Task[]> {
  const filePath = path.join(process.cwd(), 'data/tasks.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Management</h1>
        <div className="space-x-4">
          <form action={runBenchmarkAction} className="inline">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Run Benchmark Now
            </button>
          </form>
          <form action={logout} className="inline">
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-gray-800">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">No tasks found. Run a benchmark to discover content gaps.</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-primary truncate">{task.title}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <a href={task.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                        Source URL
                      </a>
                      <span className="text-xs text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <form action={updateTaskStatus.bind(null, task.id, 'completed')}>
                      <button type="submit" disabled={task.status === 'completed'} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50">
                        Done
                      </button>
                    </form>
                    <form action={updateTaskStatus.bind(null, task.id, 'ignored')}>
                      <button type="submit" disabled={task.status === 'ignored'} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 disabled:opacity-50">
                        Ignore
                      </button>
                    </form>
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
