import fs from 'fs';
import path from 'path';
import { Task } from '@/types';

export default async function AdminTasksPage() {
  const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');
  let tasks: Task[] = [];

  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    tasks = JSON.parse(data);
  } catch (e) {
    console.error('Failed to load tasks', e);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate dark:text-white">
            Automated Content Tasks
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tasks generated from competitive benchmarking.
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {tasks.length === 0 ? (
            <li className="px-6 py-10 text-center text-gray-500">No tasks found. Run benchmarking to generate tasks.</li>
          ) : (
            tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((task) => (
              <li key={task.id}>
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-primary truncate">{task.title}</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-start space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Created on {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                    {task.competitorUrl && (
                      <a
                        href={task.competitorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                      >
                        View Competitor Article →
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
