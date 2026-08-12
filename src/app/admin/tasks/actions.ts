'use server';

import { checkAuth } from '@/lib/auth';
import { loadTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function updateTaskStatus(taskId: string, status: 'pending' | 'completed' | 'ignored') {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }

  const tasks = loadTasks();
  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, status };
    }
    return task;
  });

  saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
  return { success: true };
}

export async function triggerBenchmark() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }

  const result = await runBenchmark();
  revalidatePath('/admin/tasks');
  return result;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
