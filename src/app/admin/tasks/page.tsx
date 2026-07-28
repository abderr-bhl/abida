import { getTasks, getRecords } from '@/lib/automation/benchmark';
import AdminTasksClient from './AdminTasksClient';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = await getTasks();
  const records = await getRecords();

  return <AdminTasksClient initialTasks={tasks} initialRecords={records} />;
}
