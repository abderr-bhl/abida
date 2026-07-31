import { getTasks } from '@/lib/automation/benchmark';
import TasksDashboard from './TasksDashboard';

export default async function AdminTasksPage() {
  const tasks = getTasks();
  // Sort tasks by date descending by default
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return <TasksDashboard initialTasks={sortedTasks} />;
}
export const dynamic = 'force-dynamic';
