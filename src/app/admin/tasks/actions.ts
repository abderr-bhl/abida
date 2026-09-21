'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { loadTasks, saveTasks, runCompetitiveBenchmark, TaskItem } from '@/lib/automation/benchmark';

export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || token !== adminToken) {
    redirect('/admin/login');
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}

export async function getTasksServer(): Promise<TaskItem[]> {
  await requireAuth();
  return loadTasks();
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: 'pending' | 'in_progress' | 'completed'
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' };
  }

  tasks[taskIndex].status = newStatus;
  const saved = saveTasks(tasks);

  if (!saved) {
    return { success: false, error: 'Failed to save tasks' };
  }

  revalidatePath('/admin/tasks');
  return { success: true };
}

export async function triggerBenchmark(): Promise<{ success: boolean; addedCount: number; error?: string }> {
  await requireAuth();
  try {
    const result = await runCompetitiveBenchmark();
    revalidatePath('/admin/tasks');
    return { success: true, addedCount: result.addedCount };
  } catch (err) {
    console.error('Error in triggerBenchmark:', err);
    return { success: false, addedCount: 0, error: 'Benchmark execution failed' };
  }
}
