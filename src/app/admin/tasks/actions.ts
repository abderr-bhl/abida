'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { loadTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';
import { logoutAction as authLogoutAction } from '../login/actions';

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();

  const tasks = loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' };
  }

  tasks[taskIndex].status = newStatus;
  tasks[taskIndex].updatedAt = new Date().toISOString();

  saveTasks(tasks);
  revalidatePath('/admin/tasks');

  return { success: true };
}

export async function triggerBenchmark(): Promise<{
  success: boolean;
  added?: number;
  total?: number;
  errors?: string[];
  error?: string;
}> {
  await requireAuth();

  try {
    const result = await runBenchmark();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      added: result.added,
      total: result.total,
      errors: result.errors,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function logoutAdmin(): Promise<void> {
  await authLogoutAction();
}
