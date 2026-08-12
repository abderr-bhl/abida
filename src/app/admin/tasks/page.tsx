import { loadTasks } from '@/lib/automation/benchmark';
import TaskList from './TaskList';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = loadTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <TaskList initialTasks={tasks} />
    </div>
  );
}
