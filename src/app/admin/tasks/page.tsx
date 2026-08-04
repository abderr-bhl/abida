import { getTasks, getBenchmarks } from '@/lib/automation/benchmark';
import TasksDashboardClient from './TasksDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = getTasks();
  const benchmarks = getBenchmarks();

  return (
    <TasksDashboardClient
      initialTasks={tasks}
      initialBenchmarks={benchmarks}
    />
  );
}
