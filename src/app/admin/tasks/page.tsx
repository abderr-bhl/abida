import { getTasks } from '@/lib/automation/benchmark';
import TasksDashboard from './TasksDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = await getTasks();
  return <TasksDashboard initialTasks={tasks} />;
}
