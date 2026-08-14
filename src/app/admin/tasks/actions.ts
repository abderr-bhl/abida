'use server';

import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import { runBenchmarking, loadTasks, saveTasks, AutomatedTask } from '@/lib/automation/benchmark';

/**
 * Middleware authentication check inside actions.
 */
async function ensureAuthenticated() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized action');
  }
}

/**
 * Server action to fetch all competitor automated tasks.
 */
export async function getTasksAction(): Promise<AutomatedTask[]> {
  await ensureAuthenticated();
  return loadTasks();
}

/**
 * Server action to manually trigger a competitive benchmarking run.
 * Forces a revalidation of '/admin/tasks' afterwards.
 */
export async function triggerBenchmarkAction(): Promise<{ success: boolean; added: number; total: number; error?: string }> {
  await ensureAuthenticated();
  try {
    const result = await runBenchmarking();
    revalidatePath('/admin/tasks');
    return { success: true, added: result.added, total: result.total };
  } catch (err) {
    return { success: false, added: 0, total: 0, error: (err as Error).message };
  }
}

/**
 * Server action to update the status of a specific task.
 * Forces a revalidation of '/admin/tasks' afterwards.
 */
export async function updateTaskStatusAction(
  taskId: string,
  newStatus: 'pending' | 'in_progress' | 'completed' | 'ignored'
): Promise<{ success: boolean; error?: string }> {
  await ensureAuthenticated();
  try {
    const tasks = loadTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return { success: false, error: 'Task not found' };
    }

    tasks[taskIndex].status = newStatus;
    tasks[taskIndex].updatedAt = new Date().toISOString();

    const saved = saveTasks(tasks);
    if (saved) {
      revalidatePath('/admin/tasks');
      return { success: true };
    } else {
      return { success: false, error: 'Failed to write tasks update (could be EROFS)' };
    }
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
