'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAuth, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { runBenchmark, getTasks, saveTasks, Task } from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
  await requireAuth();
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = status;
    tasks[index].updatedAt = new Date().toISOString();
    saveTasks(tasks);
    revalidatePath('/admin/tasks');
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
