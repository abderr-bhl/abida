import { Task, BenchmarkRecord } from '@/types';
import tasksData from '@/lib/tasks.json';
import benchmarksData from '@/lib/benchmarks.json';

// In a real app, this would be a Server Action or an API call to handle mutations
// For now, we use the local JSON files (mocking the database)

export default function AdminTasksPage() {
  const tasks: Task[] = tasksData as Task[];
  const benchmarks: BenchmarkRecord[] = benchmarksData as BenchmarkRecord[];

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Task Dashboard</h1>

      {/* Benchmarking Summary */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Recent Benchmarking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benchmarks.length > 0 ? benchmarks.map((record) => (
            <div key={record.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg">{record.competitor}</h3>
              <p className="text-sm text-gray-500">Last Checked: {new Date(record.lastChecked).toLocaleString()}</p>
              <p className="text-sm mt-1">New Articles Found: <span className="font-bold text-primary">{record.newArticlesFound}</span></p>
            </div>
          )) : <p className="text-gray-500 italic">No benchmarking records found yet.</p>}
        </div>
      </section>

      {/* Automated Tasks */}
      <section>
        <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Automated Content Tasks</h2>
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length > 0 ? tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((task) => (
              <li key={task.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary truncate">{task.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        {task.competitor}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                        {validateUrl(task.sourceUrl) ? (
                          <a
                            href={task.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Source Link
                          </a>
                        ) : 'Invalid URL'}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                      <p>Created on {new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                  </div>
                </div>
              </li>
            )) : <li className="px-4 py-8 text-center text-gray-500 italic">No tasks generated yet. Run benchmarking to see results.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
