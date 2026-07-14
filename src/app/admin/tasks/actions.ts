'use server';

import { getTasks, updateTaskStatus, runBenchmark } from '@/lib/automation/benchmark';
import { Task } from '@/types';
import { revalidatePath } from 'next/cache';

export async function fetchTasksAction() {
  return await getTasks();
}

export async function updateTaskStatusAction(taskId: string, status: Task['status']) {
  await updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function triggerBenchmarkAction() {
  const result = await runBenchmark();
  revalidatePath('/admin/tasks');
  return result;
}
