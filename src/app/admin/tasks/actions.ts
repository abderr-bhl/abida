'use server';

import { checkAuth } from '@/lib/auth';
import { runBenchmark, getTasks, saveTasks } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';

export async function triggerBenchmarkAction() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized: Authentication is required to run the competitor benchmark.');
  }

  const record = await runBenchmark();
  revalidatePath('/admin/tasks');
  return record;
}

export async function updateTaskStatusAction(taskId: string, status: 'pending' | 'completed' | 'ignored') {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized: Authentication is required to update competitor task status.');
  }

  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex > -1) {
    tasks[taskIndex].status = status;
    saveTasks(tasks);
    revalidatePath('/admin/tasks');
    return { success: true };
  }

  return { success: false, error: 'Task not found.' };
}
