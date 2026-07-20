import { readTasks } from '@/lib/automation/benchmark';
import AdminTasksClient from './AdminTasksClient';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = readTasks();
  return <AdminTasksClient initialTasks={tasks} />;
}
