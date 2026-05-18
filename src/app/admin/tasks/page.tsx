import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  source: string;
  url: string;
  status: 'pending' | 'completed';
  date: string;
}

export default async function AdminTasksPage() {
  const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');
  let tasks: Task[] = [];

  if (fs.existsSync(TASKS_FILE)) {
    tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Market Intelligence Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Automated tasks generated from competitor monitoring.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
          {tasks.length} Active Tasks
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 text-lg">No tasks generated yet. Run the benchmark to fetch data.</p>
          <div className="mt-6">
             <code className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">GET /api/cron/benchmark</code>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-0.5 rounded dark:bg-blue-900/30 dark:text-blue-400">
                    {task.source}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(task.date).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h3>
                <a
                  href={task.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center mt-1"
                >
                  View Source Article
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                  Generate Content
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
