'use server';

import { checkAuth } from '@/lib/auth';
import { runBenchmark, getTasks, saveTasks } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { BenchmarkRecord } from '@/types';

export async function triggerBenchmarkAction(): Promise<{ success: boolean; error?: string; record?: BenchmarkRecord }> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const record = await runBenchmark();
    revalidatePath('/admin/tasks');
    return { success: true, record };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  status: 'pending' | 'completed' | 'ignored'
): Promise<{ success: boolean; error?: string }> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return { success: false, error: 'Task not found' };
    }

    tasks[taskIndex].status = status;
    const success = saveTasks(tasks);
    if (!success) {
      return { success: false, error: 'Failed to write task update (filesystem error)' };
    }

    revalidatePath('/admin/tasks');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
