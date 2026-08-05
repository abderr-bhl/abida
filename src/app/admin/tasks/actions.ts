'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import { runBenchmarking, readTasks, writeTasks } from '@/lib/automation/benchmark';
import { Task } from '@/types';

/**
 * Triggers the RSS competitor benchmark manually.
 * Revalidates the Admin tasks path on success.
 */
export async function triggerBenchmark() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    throw new Error('Unauthorized access to administrative action.');
  }

  await runBenchmarking();
  revalidatePath('/admin/tasks');
}

/**
 * Updates the status of a specific benchmarking content task.
 */
export async function updateTaskStatus(taskId: string, status: Task['status']) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    throw new Error('Unauthorized access to administrative action.');
  }

  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex !== -1) {
    tasks[taskIndex].status = status;
    writeTasks(tasks);
    revalidatePath('/admin/tasks');
  }
}

/**
 * Logs out the administrator by deleting the token cookie and redirecting.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
