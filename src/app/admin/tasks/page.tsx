import React from 'react';
import TasksDashboard from './Dashboard';
import { readTasks, readBenchmarkRecord } from '@/lib/automation/benchmark';

// Set this page to dynamic/revalidate on each request for fresh data
export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = readTasks();
  const benchmarkRecord = readBenchmarkRecord();

  return <TasksDashboard initialTasks={tasks} initialRecord={benchmarkRecord} />;
}
