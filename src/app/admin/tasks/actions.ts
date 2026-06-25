'use server';

import { runBenchmark, updateTaskStatus, getTasks } from '@/lib/automation/benchmark';
import { Task } from '@/types';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  if (!(await isAdmin(token))) {
    throw new Error('Unauthorized');
  }
}

export async function triggerBenchmarkAction() {
  await checkAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(taskId: string, status: Task['status']) {
  await checkAuth();
  await updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function fetchTasksAction() {
  await checkAuth();
  return await getTasks();
}
