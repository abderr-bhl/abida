import { readData } from '@/lib/automation/benchmark';
import { Task, BenchmarkRecord } from '@/types';
import DashboardClient from './DashboardClient';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');
const BENCHMARKS_FILE = path.join(process.cwd(), 'data', 'benchmarks.json');

export default async function AdminTasksPage() {
  const initialTasks = readData<Task[]>(TASKS_FILE, []);
  const initialRecords = readData<BenchmarkRecord[]>(BENCHMARKS_FILE, []);

  return <DashboardClient initialTasks={initialTasks} initialRecords={initialRecords} />;
}
