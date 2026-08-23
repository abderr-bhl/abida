import React from 'react';
import { fetchTasks } from './actions';
import TaskDashboardClient from './TaskDashboardClient';

export default async function AdminTasksPage() {
  const initialTasks = await fetchTasks();

  return <TaskDashboardClient initialTasks={initialTasks} />;
}
