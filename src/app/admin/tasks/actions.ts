'use server';

import { checkAuth } from '@/lib/auth';
import { runBenchmark, loadTasks, saveTasks, loadRecords } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { Task, BenchmarkRecord } from '@/types';

async function verifyAuthOrThrow() {
  const isAuthorized = await checkAuth();
  if (!isAuthorized) {
    throw new Error('Unauthorized operational access.');
  }
}

export async function triggerBenchmarkAction() {
  await verifyAuthOrThrow();
  const record = await runBenchmark();
  revalidatePath('/admin/tasks');
  return { success: true, record };
}

export async function fetchTasksAction(): Promise<Task[]> {
  await verifyAuthOrThrow();
  return loadTasks();
}

export async function fetchRecordsAction(): Promise<BenchmarkRecord[]> {
  await verifyAuthOrThrow();
  return loadRecords();
}

export async function updateTaskStatusAction(taskId: string, newStatus: 'Pending' | 'Completed' | 'Ignored') {
  await verifyAuthOrThrow();
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
    saveTasks(tasks);
    revalidatePath('/admin/tasks');
    return { success: true };
  }
  return { success: false, error: 'Task not found.' };
}
