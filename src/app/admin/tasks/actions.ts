'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { getTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';
import { BenchmarkTask } from '@/types';

export async function triggerBenchmarkAction(): Promise<{ success: boolean; count: number }> {
  await requireAuth();
  const newTasks = await runBenchmark();
  revalidatePath('/admin/tasks');
  return { success: true, count: newTasks.length };
}

export async function updateTaskStatusAction(
  taskId: string,
  status: BenchmarkTask['status']
): Promise<{ success: boolean }> {
  await requireAuth();
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = status;
    saveTasks(tasks);
    revalidatePath('/admin/tasks');
    return { success: true };
  }
  return { success: false };
}

export async function logoutAction(): Promise<void> {
  await requireAuth();
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
