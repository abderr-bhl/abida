import { Task } from '@/types';
import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';

async function getTasks(): Promise<Task[]> {
  const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Automated Content Tasks</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor Link</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                  <div className="text-sm text-gray-500">{task.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.priority}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  {isValidUrl(task.competitorUrl) ? (
                    <a href={task.competitorUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      View Source
                    </a>
                  ) : (
                    'Invalid Link'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(task.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div className="p-8 text-center text-gray-500">No tasks generated yet. Run the benchmark to see results.</div>
        )}
      </div>

      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline">← Back to Site</Link>
      </div>
    </div>
  );
}
