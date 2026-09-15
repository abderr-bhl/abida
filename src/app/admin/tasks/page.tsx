import { getTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, changeTaskStatus, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Task Management</h1>
            <p className="text-sm text-gray-500">Automated competitive benchmarking tasks</p>
          </div>
          <div className="flex items-center space-x-4">
            <form action={triggerBenchmark}>
              <button
                type="submit"
                className="bg-[#0060df] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                Run Benchmark Now
              </button>
            </form>
            <form action={logoutAction}>
              <button
                type="submit"
                className="border border-gray-300 text-gray-700 bg-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Tasks ({tasks.length})
            </h2>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tasks found. Click &quot;Run Benchmark Now&quot; to fetch content gaps from competitors.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {task.competitor}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      {task.sourceUrl && (
                        <div className="pt-1">
                          <a
                            href={sanitizeUrl(task.sourceUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#0060df] hover:underline flex items-center gap-1"
                          >
                            Source Article
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {task.status !== 'pending' && (
                        <form
                          action={async () => {
                            'use server';
                            await changeTaskStatus(task.id, 'pending');
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200"
                          >
                            Mark Pending
                          </button>
                        </form>
                      )}
                      {task.status !== 'in_progress' && (
                        <form
                          action={async () => {
                            'use server';
                            await changeTaskStatus(task.id, 'in_progress');
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded hover:bg-yellow-200"
                          >
                            In Progress
                          </button>
                        </form>
                      )}
                      {task.status !== 'completed' && (
                        <form
                          action={async () => {
                            'use server';
                            await changeTaskStatus(task.id, 'completed');
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded hover:bg-green-200"
                          >
                            Complete
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
