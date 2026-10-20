import { getTasks } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import RunBenchmarkButton from './RunBenchmarkButton';
import LogoutButton from './LogoutButton';
import { ExternalLink, CheckCircle2, Clock, AlertCircle, Layers } from 'lucide-react';

export const revalidate = 0;

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'Pending').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Automated Competitor Tasks
            </h1>
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Live Benchmark
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated content gap tasks generated daily by benchmarking US market leaders (Wirecutter, RTINGS).
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton />
          <RunBenchmarkButton />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pending}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{inProgress}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{completed}</p>
          </div>
        </div>
      </div>

      {/* Task list section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Task Backlog ({tasks.length})
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No competitor tasks found. Click &quot;Run Benchmark Now&quot; to fetch latest items.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => {
              const safeSourceUrl = sanitizeUrl(task.sourceUrl);
              return (
                <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {task.competitor}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          {task.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          Created {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="pt-1">
                        <a
                          href={safeSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Source: {task.sourceUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-start md:self-center">
                      <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
