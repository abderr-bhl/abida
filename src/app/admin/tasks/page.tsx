import Link from 'next/link';
import { getAllTasks, AutomatedTask } from '@/lib/automation/benchmark';
import { runBenchmarkAction, logoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminTasksPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const allTasks = getAllTasks();

  const filteredTasks = status
    ? allTasks.filter(t => t.status === status)
    : allTasks;

  const counts = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    in_progress: allTasks.filter(t => t.status === 'in_progress').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    ignored: allTasks.filter(t => t.status === 'ignored').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              Automated Operations
            </span>
            <span className="text-xs text-gray-500">Target Market: USA</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            Competitor Intelligence & Task Engine
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Daily automated benchmarking of top US review competitors (Wirecutter, RTINGS) to generate high-converting buyer guides and product reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={runBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-700 rounded-lg"
            >
              Log Out
            </button>
          </form>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 my-8">
        <Link
          href="/admin/tasks"
          className={`p-4 rounded-xl border transition-all ${
            !status ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="text-xs font-medium text-gray-500">All Tasks</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.total}</div>
        </Link>
        <Link
          href="/admin/tasks?status=pending"
          className={`p-4 rounded-xl border transition-all ${
            status === 'pending' ? 'bg-yellow-500/10 border-yellow-500 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="text-xs font-medium text-yellow-600">Pending Review</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.pending}</div>
        </Link>
        <Link
          href="/admin/tasks?status=in_progress"
          className={`p-4 rounded-xl border transition-all ${
            status === 'in_progress' ? 'bg-blue-500/10 border-blue-500 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="text-xs font-medium text-blue-600">In Production</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.in_progress}</div>
        </Link>
        <Link
          href="/admin/tasks?status=completed"
          className={`p-4 rounded-xl border transition-all ${
            status === 'completed' ? 'bg-green-500/10 border-green-500 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="text-xs font-medium text-green-600">Published</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.completed}</div>
        </Link>
        <Link
          href="/admin/tasks?status=ignored"
          className={`p-4 rounded-xl border transition-all ${
            status === 'ignored' ? 'bg-gray-500/10 border-gray-500 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="text-xs font-medium text-gray-500">Ignored</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.ignored}</div>
        </Link>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {status ? `${status.replace('_', ' ').toUpperCase()} Tasks` : 'All Automated Tasks'}
          </h2>
          <span className="text-xs text-gray-500">
            Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            <p className="text-base font-semibold">No tasks found</p>
            <p className="text-sm mt-1">Click &quot;Run Benchmark Now&quot; to scan competitor feeds and generate tasks.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredTasks.map((task: AutomatedTask) => (
              <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {task.category}
                      </span>
                      <span className="text-xs uppercase tracking-wider font-bold text-primary">
                        {task.contentType}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                        }`}
                      >
                        {task.priority} priority
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                      <span>Source: <strong className="text-gray-700 dark:text-gray-300">{task.competitorSource}</strong></span>
                      <span>Target Keyword: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{task.targetKeyword}</code></span>
                      <a
                        href={sanitizeUrl(task.competitorUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View Competitor Article
                        <svg className="w-3 h-3 fill-none stroke-current" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start">
                    <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
