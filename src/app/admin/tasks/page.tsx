import { loadTasks } from '@/lib/automation/benchmark';
import { TaskStatusSelect } from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';
import { triggerBenchmarkAction, updateTaskStatusAction, logoutAction } from './actions';
import { ExternalLink, RefreshCw, LogOut, CheckCircle, Clock, PlayCircle } from 'lucide-react';

export default async function AdminTasksPage() {
  const tasks = loadTasks();

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-5 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitive Task Automation Engine</h1>
          <p className="mt-1 text-sm text-gray-500">
            Automated daily content gap task generator benchmarking Wirecutter and RTINGS for reviewguid.com (US Market).
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0060df] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0060df] transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0060df] transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 text-[#0060df] rounded-lg p-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Benchmarked Tasks</dt>
              <dd className="text-2xl font-bold text-gray-900">{totalTasks}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-50 text-yellow-600 rounded-lg p-3">
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Tasks</dt>
              <dd className="text-2xl font-bold text-gray-900">{pendingTasks}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 text-blue-600 rounded-lg p-3">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</dt>
              <dd className="text-2xl font-bold text-gray-900">{inProgressTasks}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 text-green-600 rounded-lg p-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</dt>
              <dd className="text-2xl font-bold text-gray-900">{completedTasks}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Competitor Tasks & Content Gaps</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tasks found. Click &quot;Run Benchmark Now&quot; above to scan competitors for content gaps.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Task Title / Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Competitor Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Benchmarked Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => {
                  const safeSourceUrl = sanitizeUrl(task.sourceUrl);
                  return (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-500 mt-1 max-w-xl line-clamp-2">{task.description}</div>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {task.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.sourceCompetitor}</div>
                        {safeSourceUrl !== '#' && (
                          <a
                            href={safeSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-[#0060df] hover:underline mt-1"
                            aria-label={`View competitor source on ${task.sourceCompetitor} (opens in new tab)`}
                          >
                            View Source <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TaskStatusSelect
                          taskId={task.id}
                          currentStatus={task.status}
                          onStatusChange={updateTaskStatusAction}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
