import { getTasks } from '@/lib/automation/benchmark';
import AdminTasksClient from './AdminTasksClient';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return <AdminTasksClient initialTasks={tasks} />;
}
