'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import { runBenchmark, getTasks, saveTasks } from '@/lib/automation/benchmark';
import { Task } from '@/types';

/**
 * Manually triggers the benchmarking process.
 * Requires active administrative authentication.
 */
export async function triggerBenchmarkAction() {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    throw new Error('Unauthorized');
  }

  const result = await runBenchmark();
  revalidatePath('/admin/tasks');
  return result;
}

/**
 * Updates the status of an existing competitor benchmarking task.
 * Requires active administrative authentication.
 */
export async function updateTaskStatusAction(id: string, status: Task['status']) {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    throw new Error('Unauthorized');
  }

  const tasks = await getTasks();
  const updatedTasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, status };
    }
    return task;
  });

  await saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
  return { success: true };
}

/**
 * Logs out the administrator by clearing the 'admin-token' cookie.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
