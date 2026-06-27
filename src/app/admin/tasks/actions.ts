'use server';

import { getTasks, runBenchmark as runBenchmarkLib } from '@/lib/automation/benchmark';
import { checkAuth } from '@/lib/auth';
import { Task } from '@/types';
import fs from 'fs';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function fetchTasksAction() {
  await checkAuth(true);
  return await getTasks();
}

export async function runBenchmarkAction() {
  await checkAuth(true);
  return await runBenchmarkLib();
}

export async function updateTaskStatusAction(taskId: string, status: Task['status']) {
  await checkAuth(true);

  const tasks = await getTasks();
  const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);

  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(updatedTasks, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { success: false };
  }
}
