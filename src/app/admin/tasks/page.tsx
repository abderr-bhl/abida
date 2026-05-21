import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

function getData<T>(filename: string): T[] {
  const filePath = path.join(process.cwd(), 'src/lib', filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return [];
}

export default async function AdminTasksPage() {
  const tasks = getData<Task>('tasks.json');
  const benchmarks = getData<BenchmarkRecord>('benchmarks.json');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin: Automated Benchmarking</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Competitor Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benchmarks.map((b) => (
            <div key={b.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold">{b.competitor}</span>
                <span className={`px-2 py-1 rounded text-xs ${b.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {b.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Last checked: {new Date(b.lastChecked).toLocaleString()}</p>
            </div>
          ))}
          {benchmarks.length === 0 && <p className="text-gray-500">No benchmarks run yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Generated Tasks ({tasks.length})</h2>
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                    {task.sourceUrl && (
                      <a href={task.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        View source
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.status}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(task.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No tasks generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
