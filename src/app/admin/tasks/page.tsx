import { loadTasks } from '@/lib/automation/benchmark';
import TaskDashboardClient from './TaskDashboardClient';

export default async function AdminTasksPage() {
  const initialTasks = loadTasks();

  return <TaskDashboardClient initialTasks={initialTasks} />;
}
