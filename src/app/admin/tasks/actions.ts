'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmark, loadTasks, saveTasks, Task } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: Task['status']
): Promise<void> {
  await requireAuth();
  const tasks = loadTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, status: newStatus } : task
  );
  saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
