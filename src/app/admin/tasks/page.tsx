import fs from 'fs';
import path from 'path';
import { Task } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');

function getTasks(): Task[] {
  if (!fs.existsSync(TASKS_FILE)) return [];
  const content = fs.readFileSync(TASKS_FILE, 'utf-8');
  return JSON.parse(content);
}

export default function AdminTasksPage() {
  const tasks = getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Automated Content Tasks</h1>

      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500">No tasks generated yet. The benchmark will run daily.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md border border-gray-200 dark:border-gray-700">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((task) => (
              <li key={task.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-primary">{task.title}</p>
                    <div className="ml-2 flex flex-shrink-0">
                      <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {task.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Source: {task.source}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Competitor Article
                        </a>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Detected on {new Date(task.date).toLocaleDateString()}
                      </p>
                    </div>
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
