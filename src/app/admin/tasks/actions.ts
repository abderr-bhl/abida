'use server';

import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import { runBenchmark, getTasks, updateTaskStatus } from '@/lib/automation/benchmark';
import { Task } from '@/types';

export async function triggerBenchmarkAction(): Promise<{ success: boolean; message: string; count?: number }> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const result = await runBenchmark();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      message: `Benchmark completed successfully. Found ${result.newTasksCount} new tasks.`,
      count: result.newTasksCount,
    };
  } catch (error) {
    console.error('Error in triggerBenchmarkAction:', error);
    return { success: false, message: 'Failed to run benchmark.' };
  }
}

export async function updateTaskStatusAction(taskId: string, status: Task['status']): Promise<{ success: boolean; message: string }> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, message: 'Unauthorized' };
  }

  const updated = updateTaskStatus(taskId, status);
  if (!updated) {
    return { success: false, message: 'Task not found or update failed.' };
  }

  revalidatePath('/admin/tasks');
  return { success: true, message: 'Status updated.' };
}

export async function getTasksAction(): Promise<Task[]> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return [];
  }
  return getTasks();
}
