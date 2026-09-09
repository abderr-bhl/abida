import { getTasks } from '@/lib/automation/benchmark';
import TaskList from './TaskList';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return <TaskList initialTasks={tasks} />;
}
