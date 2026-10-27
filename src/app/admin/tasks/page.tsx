import { getStoredTasks } from '@/lib/automation/benchmark';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { triggerBenchmark, updateTaskStatus, logoutAdmin } from './actions';

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminTasksPage({ searchParams }: Props) {
  const { status: statusFilter } = await searchParams;
  const allTasks = await getStoredTasks();

  const filteredTasks = statusFilter && statusFilter !== 'all'
    ? allTasks.filter(t => t.status === statusFilter)
    : allTasks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Competitor Benchmarking & Task Hub</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Automatically generated content tasks based on daily competitor analysis (Wirecutter & RTINGS).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-sm text-sm"
            >
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">Filter by Status:</span>
          {['all', 'pending', 'in-progress', 'completed', 'dismissed'].map(status => (
            <a
              key={status}
              href={status === 'all' ? '/admin/tasks' : `/admin/tasks?status=${status}`}
              className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                (statusFilter === status || (!statusFilter && status === 'all'))
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {status}
            </a>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks found. Click &quot;Run Benchmark Now&quot; to fetch competitor updates and generate new tasks.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map(task => (
              <div key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {task.source}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <TaskStatusSelect
                      taskId={task.id}
                      currentStatus={task.status}
                      onStatusChange={updateTaskStatus}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{task.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
                  {task.sourceUrl && (
                    <a
                      href={task.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      View Source Link →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
