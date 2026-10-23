'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmark, loadTasks, saveTasks } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<void> {
  await requireAuth();
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = status;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    saveTasks(tasks);
    revalidatePath('/admin/tasks');
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
