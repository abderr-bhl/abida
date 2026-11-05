import { getTasks } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { triggerBenchmarkAction } from './actions';
import { logoutAction } from '@/app/admin/login/actions';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
              Automated Intelligence
            </span>
            <span className="text-xs text-gray-500">
              Daily Cron: 05:00 UTC (Wirecutter &amp; RTINGS)
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            Competitive Benchmarking Tasks
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Automated tasks generated from US competitor review coverage. Benchmark competitor gaps and generate winning buyer guides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form
            action={async () => {
              'use server';
              await triggerBenchmarkAction();
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-8">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Tasks
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {tasks.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-yellow-200 dark:border-yellow-900/40 shadow-sm">
          <p className="text-xs font-medium text-yellow-600 uppercase tracking-wider">
            Pending Editorial
          </p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {pendingCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-blue-200 dark:border-blue-900/40 shadow-sm">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
            In Progress
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {inProgressCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-green-200 dark:border-green-900/40 shadow-sm">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Editorial Pipeline
          </h2>
          <span className="text-xs text-gray-500">
            Sorted by priority &amp; recency
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No benchmarking tasks yet. Click &quot;Run Benchmark Now&quot; to fetch latest competitor articles.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3">Task / Angle</th>
                  <th scope="col" className="px-6 py-3">Competitor</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3">Priority</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {task.description}
                      </div>
                      {task.suggestedAngle && (
                        <div className="mt-2 text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 p-2 rounded">
                          <strong className="font-semibold">Strategy:</strong> {task.suggestedAngle}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        {task.competitor}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {task.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TaskStatusSelect
                        taskId={task.id}
                        currentStatus={task.status}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <a
                        href={sanitizeUrl(task.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        View Feed
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
