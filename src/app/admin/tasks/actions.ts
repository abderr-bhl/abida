'use server';

import { checkAuth } from '@/lib/auth';
import { getTasks, saveData, runBenchmark } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function triggerBenchmarkAction(): Promise<{ success?: boolean; error?: string; tasksGenerated?: number }> {
  const isAuthorized = await checkAuth();
  if (!isAuthorized) {
    return { error: 'Unauthorized administrative operation.' };
  }

  try {
    const result = await runBenchmark();
    revalidatePath('/admin/tasks');
    return { success: true, tasksGenerated: result.tasksGenerated };
  } catch (error) {
    console.error('Manual benchmark trigger failed:', error);
    return { error: 'Failed to run competitive benchmarking.' };
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  status: 'pending' | 'completed' | 'ignored'
): Promise<{ success?: boolean; error?: string }> {
  const isAuthorized = await checkAuth();
  if (!isAuthorized) {
    return { error: 'Unauthorized administrative operation.' };
  }

  try {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return { error: 'Task not found.' };
    }

    tasks[taskIndex].status = status;
    saveData(tasks);

    revalidatePath('/admin/tasks');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { error: 'Failed to update task status.' };
  }
}

export async function logoutAdminAction(): Promise<{ success?: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  return { success: true };
}
