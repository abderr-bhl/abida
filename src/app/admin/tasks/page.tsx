import React from 'react';
import { getTasks, getBenchmarkRecord } from '@/lib/automation/benchmark';
import TasksDashboardClient from './TasksDashboardClient';

export default async function AdminTasksPage() {
  const tasks = getTasks();
  const benchmarkRecord = getBenchmarkRecord();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <TasksDashboardClient
        initialTasks={tasks}
        initialBenchmarkRecord={benchmarkRecord}
      />
    </div>
  );
}
