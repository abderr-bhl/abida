'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmarking, loadTasks, saveTasks, Task } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmarking();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, newStatus: Task['status']): Promise<void> {
  await requireAuth();
  const tasks = await loadTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, status: newStatus } : task
  );
  await saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
