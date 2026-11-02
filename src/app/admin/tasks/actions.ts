'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ADMIN_COOKIE_NAME, requireAuth } from '@/lib/auth';
import { loadTasks, runBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { ContentTask, TaskStatus } from '@/types';

export async function fetchTasks(): Promise<ContentTask[]> {
  await requireAuth();
  return loadTasks();
}

export async function triggerBenchmark(): Promise<{ count: number; total: number }> {
  await requireAuth();
  const result = await runBenchmark();
  revalidatePath('/admin/tasks');
  return {
    count: result.newTasksCount,
    total: result.totalTasksCount
  };
}

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: TaskStatus
): Promise<ContentTask | null> {
  await requireAuth();
  const updated = updateTaskStatus(taskId, newStatus);
  revalidatePath('/admin/tasks');
  return updated;
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
