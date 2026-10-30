import { getTasks } from '@/lib/automation/benchmark';
import { logoutAction } from '@/app/admin/login/actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import RunBenchmarkButton from '@/components/RunBenchmarkButton';
import { sanitizeUrl } from '@/lib/sanitize';
import { ExternalLink, LogOut, CheckCircle2, Clock, AlertCircle, Layers } from 'lucide-react';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Bar */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Competitor Task Automation
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Automated daily content benchmarking from US market leaders (Wirecutter, RTINGS)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg text-primary">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Competitor Benchmarking Trigger
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Trigger an instant RSS benchmark scan against competitor feeds (Wirecutter & RTINGS).
          </p>
        </div>

        <RunBenchmarkButton />
      </div>

      {/* Tasks Table / List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Automated Content Strategy Tasks ({tasks.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No tasks created yet. Click &quot;Run Benchmark Now&quot; to scan competitors.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {task.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {task.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {task.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                    <span>Source: <strong className="text-gray-700 dark:text-gray-300">{task.source}</strong></span>
                    <span>•</span>
                    <a
                      href={sanitizeUrl(task.sourceUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      View Original Feed Item <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center lg:flex-col lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Status:
                  </span>
                  <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
