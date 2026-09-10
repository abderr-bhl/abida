import { getAllTasks } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import { Task, TaskStatus } from '@/types';
import { triggerBenchmark, updateTaskStatusAction, logoutAction } from './actions';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminTasksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentFilter = params.status || 'all';

  const allTasks = getAllTasks();

  const filteredTasks = currentFilter === 'all'
    ? allTasks
    : allTasks.filter((task) => task.status === currentFilter);

  const pendingCount = allTasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = allTasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = allTasks.filter((t) => t.status === 'completed').length;
  const dismissedCount = allTasks.filter((t) => t.status === 'dismissed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between border-b border-gray-200 pb-6 dark:border-gray-800">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Competitive Task Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated task generation based on competitor benchmarks (Wirecutter, RTINGS).
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-8">
        <a
          href="/admin/tasks?status=all"
          className={`p-4 rounded-lg border text-center transition-colors ${
            currentFilter === 'all'
              ? 'bg-blue-50 border-primary dark:bg-blue-950 dark:border-blue-700'
              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          }`}
        >
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{allTasks.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mt-1">All Tasks</div>
        </a>
        <a
          href="/admin/tasks?status=pending"
          className={`p-4 rounded-lg border text-center transition-colors ${
            currentFilter === 'pending'
              ? 'bg-amber-50 border-amber-500 dark:bg-amber-950 dark:border-amber-700'
              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          }`}
        >
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mt-1">Pending</div>
        </a>
        <a
          href="/admin/tasks?status=in-progress"
          className={`p-4 rounded-lg border text-center transition-colors ${
            currentFilter === 'in-progress'
              ? 'bg-blue-50 border-blue-500 dark:bg-blue-950 dark:border-blue-700'
              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          }`}
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mt-1">In Progress</div>
        </a>
        <a
          href="/admin/tasks?status=completed"
          className={`p-4 rounded-lg border text-center transition-colors ${
            currentFilter === 'completed'
              ? 'bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-700'
              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          }`}
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mt-1">Completed</div>
        </a>
        <a
          href="/admin/tasks?status=dismissed"
          className={`p-4 rounded-lg border text-center transition-colors ${
            currentFilter === 'dismissed'
              ? 'bg-gray-100 border-gray-400 dark:bg-gray-800 dark:border-gray-600'
              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          }`}
        >
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{dismissedCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mt-1">Dismissed</div>
        </a>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {currentFilter === 'all' ? 'All Tasks' : `${currentFilter} Tasks`} ({filteredTasks.length})
          </h2>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks found for this filter. Click &quot;Run Benchmark Now&quot; to fetch new competitor items.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  const sanitizedSourceUrl = sanitizeUrl(task.sourceUrl);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Pending</span>;
      case 'in-progress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">In Progress</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Completed</span>;
      case 'dismissed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Dismissed</span>;
    }
  };

  return (
    <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="space-y-2 flex-1">
        <div className="flex items-center space-x-3">
          {getStatusBadge(task.status)}
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Source: {task.source}
          </span>
          {task.priority && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 uppercase">
              {task.priority} Priority
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {task.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {task.description}
        </p>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4 pt-1">
          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
          {sanitizedSourceUrl !== '#' && (
            <a
              href={sanitizedSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              View Competitor Link &rarr;
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-wrap md:flex-col gap-2 min-w-[140px]">
        {task.status !== 'in-progress' && task.status !== 'completed' && (
          <form action={updateTaskStatusAction.bind(null, task.id, 'in-progress')}>
            <button
              type="submit"
              className="w-full text-xs px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded font-medium transition-colors"
            >
              Start Task
            </button>
          </form>
        )}
        {task.status !== 'completed' && (
          <form action={updateTaskStatusAction.bind(null, task.id, 'completed')}>
            <button
              type="submit"
              className="w-full text-xs px-3 py-1.5 border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded font-medium transition-colors"
            >
              Mark Complete
            </button>
          </form>
        )}
        {task.status !== 'dismissed' && (
          <form action={updateTaskStatusAction.bind(null, task.id, 'dismissed')}>
            <button
              type="submit"
              className="w-full text-xs px-3 py-1.5 border border-gray-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-medium transition-colors"
            >
              Dismiss Task
            </button>
          </form>
        )}
        {task.status !== 'pending' && (
          <form action={updateTaskStatusAction.bind(null, task.id, 'pending')}>
            <button
              type="submit"
              className="w-full text-xs px-3 py-1.5 border border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded font-medium transition-colors"
            >
              Reset to Pending
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
