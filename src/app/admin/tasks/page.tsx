import fs from 'fs';
import path from 'path';
import { Task } from '@/types';

async function getTasks(): Promise<Task[]> {
  const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
  return [];
}

// Simple URL validation
function isValidUrl(urlString: string | undefined): boolean {
  if (!urlString) return false;
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Automated Competitive Tasks</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {tasks.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              No tasks generated yet. Run the benchmark to discover content gaps.
            </li>
          ) : (
            tasks.map((task) => (
              <li key={task.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary truncate">{task.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        Competitor: {task.competitor}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
                      <p>
                        Created on <time dateTime={task.createdAt}>{new Date(task.createdAt).toLocaleDateString()}</time>
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                    {task.sourceUrl && isValidUrl(task.sourceUrl) && (
                      <a
                        href={task.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline mt-1 block"
                      >
                        View Source Article →
                      </a>
                    )}
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
