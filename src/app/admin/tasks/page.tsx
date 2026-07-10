import { getTasks, triggerBenchmark, updateTaskStatus } from './actions';
import { logout } from '../login/actions';
import { TaskStatus } from '@/types';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
          <div className="flex space-x-4">
            <form action={triggerBenchmark}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Run Benchmark Now
              </button>
            </form>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks generated yet. Run a benchmark to start.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Source: <a href={task.competitorUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{task.competitorUrl}</a>
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            task.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Type: {task.type} | Priority: {task.priority}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 space-x-2">
                        <StatusButton taskId={task.id} status="in-progress" label="Start" currentStatus={task.status} />
                        <StatusButton taskId={task.id} status="completed" label="Complete" currentStatus={task.status} />
                        <StatusButton taskId={task.id} status="dismissed" label="Dismiss" currentStatus={task.status} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusButton({ taskId, status, label, currentStatus }: { taskId: string, status: TaskStatus, label: string, currentStatus: TaskStatus }) {
  if (currentStatus === status) return null;

  return (
    <form action={async () => {
      'use server';
      await updateTaskStatus(taskId, status);
    }}>
      <button
        type="submit"
        className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50"
      >
        {label}
      </button>
    </form>
  );
}
