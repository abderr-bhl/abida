'use server';

import { checkAuth } from '@/lib/auth';
import { runBenchmark as trigger, updateTaskStatus as update } from '@/lib/automation/benchmark';
import { Task } from '@/types';
import { revalidatePath } from 'next/cache';

export async function triggerBenchmark() {
  if (!(await checkAuth())) throw new Error('Unauthorized');
  const newTasks = await trigger();
  revalidatePath('/admin/tasks');
  return newTasks;
}

export async function updateTaskStatusAction(id: string, status: Task['status']) {
  if (!(await checkAuth())) throw new Error('Unauthorized');
  const success = update(id, status);
  if (success) {
    revalidatePath('/admin/tasks');
  }
  return success;
}
