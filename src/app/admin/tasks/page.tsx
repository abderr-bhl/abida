import { getTasks } from '@/lib/automation/benchmark';
import TaskListClient from './TaskListClient';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Competitive Benchmarking Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated tasks generated from monitoring US competitors (Wirecutter, RTINGS).
          </p>
        </div>
      </div>

      <TaskListClient initialTasks={tasks} />
    </div>
  );
}
