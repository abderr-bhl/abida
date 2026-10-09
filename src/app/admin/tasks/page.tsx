import { logoutAction } from "@/app/admin/login/actions";
import { triggerBenchmark } from "@/app/admin/tasks/actions";
import TaskStatusSelect from "@/components/TaskStatusSelect";
import { getTasks } from "@/lib/automation/benchmark";
import { sanitizeUrl } from "@/lib/sanitize";

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8 border-b border-gray-200 pb-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold leading-7 text-gray-900 sm:text-4xl sm:truncate">
            Automated Competitive Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage automatically generated tasks benchmarked from competitor analysis.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No benchmark tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Click &quot;Run Benchmark Now&quot; to fetch competitor review feeds and generate tasks.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task.id} className="p-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {task.source}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900">{task.title}</h2>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{task.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {new Date(task.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
                  {task.url && (
                    <a
                      href={sanitizeUrl(task.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                    >
                      View Source
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
