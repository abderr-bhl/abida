'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { loadTasks, saveTasks, runBenchmarking } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  try {
    await runBenchmarking();
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Failed to trigger benchmark:', error);
  }
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus
): Promise<{ success: boolean }> {
  await requireAuth();
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return { success: false };
  }

  tasks[taskIndex].status = newStatus;
  saveTasks(tasks);
  revalidatePath('/admin/tasks');
  return { success: true };
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
