'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import { loadTasks, saveTasks, runBenchmarking, Task } from '@/lib/automation/benchmark';

export async function updateTaskStatus(taskId: string, newStatus: Task['status']) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    throw new Error('Unauthorized');
  }

  const tasks = await loadTasks();
  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, status: newStatus };
    }
    return task;
  });

  await saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function triggerBenchmark(): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    throw new Error('Unauthorized');
  }

  await runBenchmarking();
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
