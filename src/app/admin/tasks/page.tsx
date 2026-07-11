import { getTasks, runBenchmark } from './actions';
import { Task } from '@/types';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Automated Content Tasks</h1>
        <form action={runBenchmark}>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Run Benchmark Now
          </button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">No tasks generated yet. Run benchmark to find opportunities.</li>
          ) : (
            tasks.map((task: Task) => (
              <li key={task.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary truncate">{task.competitor}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <a href={task.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Competitor Article
                      </a>
                      <span className="mx-2">•</span>
                      <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
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
