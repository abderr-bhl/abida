'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getTasks, saveTasks, runCompetitiveBenchmark, Task } from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runCompetitiveBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
  await requireAuth();
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    saveTasks(tasks);
    revalidatePath('/admin/tasks');
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
