'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import { loadTasks, saveData, runCompetitiveBenchmarking } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function updateTaskStatusAction(taskId: string, newStatus: TaskStatus): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const tasks = await loadTasks();
  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, status: newStatus };
    }
    return task;
  });

  await saveData(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function triggerBenchmarkAction(): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  await runCompetitiveBenchmarking();
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
