import { getTasks, triggerBenchmark, updateTaskStatus } from './actions';
import { logout } from '../login/actions';
import { TaskStatus } from '@/types';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Opportunities</h1>
          <p className="text-gray-600 mt-1">Daily benchmarking from USA market leaders.</p>
        </div>
        <div className="flex gap-4">
          <form action={triggerBenchmark}>
            <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Run Benchmark Now
            </button>
          </form>
          <form action={logout}>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              No tasks found. Run a benchmark to discover new content.
            </li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.competitor === 'Wirecutter' ? 'bg-black text-white' : 'bg-red-600 text-white'
                      }`}>
                        {task.competitor}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {task.title}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'ignored' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View Original Article
                      </a>
                      <span className="text-xs text-gray-400">Found on {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    {['pending', 'in-progress', 'completed', 'ignored'].map((status) => (
                      task.status !== status && (
                        <form key={status} action={updateTaskStatus.bind(null, task.id, status as TaskStatus)}>
                          <button className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded hover:bg-gray-100 capitalize">
                            Mark {status}
                          </button>
                        </form>
                      )
                    ))}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
