import { getTasks } from '@/lib/automation/benchmark';
import { TaskList } from './TaskList';
import { TriggerBenchmarkButton } from './TriggerBenchmarkButton';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Automation Tasks</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage tasks generated from competitor benchmarking.</p>
        </div>
        <TriggerBenchmarkButton />
      </div>

      <div className="bg-white shadow rounded-lg dark:bg-gray-900 dark:border dark:border-gray-800">
        <TaskList initialTasks={tasks} />
      </div>
    </div>
  );
}
