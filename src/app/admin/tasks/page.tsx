import { loadTasks } from '@/lib/automation/benchmark';
import AdminTasksClient from './AdminTasksClient';

export default async function AdminTasksPage() {
  const tasks = loadTasks();
  return <AdminTasksClient initialTasks={tasks} />;
}
