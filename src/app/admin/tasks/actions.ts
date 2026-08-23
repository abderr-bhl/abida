'use server';

import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import { loadTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';
import { Task } from '@/types';

export async function fetchTasks(): Promise<Task[]> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized access');
  }
  return await loadTasks();
}

export async function triggerBenchmark(
  prevState?: unknown,
  formData?: FormData
): Promise<{ success: boolean; message: string; addedCount?: number }> {
  void prevState;
  void formData;

  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const result = await runBenchmark();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      message: `Benchmark completed! Found and created ${result.addedCount} new tasks.`,
      addedCount: result.addedCount,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      message: `Failed to run benchmark: ${error.message}`,
    };
  }
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: 'pending' | 'in-progress' | 'completed'
): Promise<{ success: boolean; message?: string }> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, message: 'Unauthorized' };
  }

  const tasks = await loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return { success: false, message: 'Task not found' };
  }

  tasks[taskIndex].status = newStatus;
  tasks[taskIndex].updatedAt = new Date().toISOString();

  await saveTasks(tasks);
  revalidatePath('/admin/tasks');
  return { success: true };
}
