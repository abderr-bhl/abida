import { getTasks } from '@/lib/automation/benchmark';
import TaskDashboard from './TaskDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  // Sort tasks by date descending initially
  const sortedTasks = [...tasks].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return <TaskDashboard initialTasks={sortedTasks} />;
}
