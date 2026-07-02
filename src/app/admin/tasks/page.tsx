import { requireAuth } from '@/lib/auth';
import { getTasks, runBenchmarkAction, updateTaskStatus } from './actions';
import { Task } from '@/types';
import { logoutAction } from '../login/actions';

export default async function TasksPage() {
  await requireAuth();
  const tasks = await getTasks();

  async function updateStatus(taskId: string, status: Task['status']) {
    'use server';
    await updateTaskStatus(taskId, status);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="text-gray-500">Automated Competitive Benchmarking</p>
        </div>
        <div className="flex gap-4">
          <form action={runBenchmarkAction}>
            <button className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tasks.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500">No tasks generated yet. Run a benchmark to start.</p>
          </div>
        ) : (
          tasks.map((task: Task) => (
            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    task.status === 'todo' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{task.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                <a
                  href={task.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
                >
                  View Source Article
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
              </div>
              <div className="flex gap-2 shrink-0">
                {task.status !== 'in-progress' && task.status !== 'completed' && (
                  <form action={updateStatus.bind(null, task.id, 'in-progress')}>
                    <button className="text-xs font-bold px-4 py-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer">
                      Start
                    </button>
                  </form>
                )}
                {task.status !== 'completed' && (
                  <form action={updateStatus.bind(null, task.id, 'completed')}>
                    <button className="text-xs font-bold px-4 py-2 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors cursor-pointer">
                      Complete
                    </button>
                  </form>
                )}
                <form action={updateStatus.bind(null, task.id, 'archived')}>
                  <button className="text-xs font-bold px-4 py-2 rounded bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                    Archive
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
