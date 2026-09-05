'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import {
  getTasks as fetchBenchmarkTasks,
  updateTaskStatus as modifyTaskStatus,
  runBenchmark as executeBenchmark
} from '@/lib/automation/benchmark';
import { BenchmarkTask } from '@/types';

export async function getTasksAction(): Promise<BenchmarkTask[]> {
  await requireAuth();
  return await fetchBenchmarkTasks();
}

export async function updateTaskStatusAction(
  taskId: string,
  status: BenchmarkTask['status']
): Promise<void> {
  await requireAuth();
  await modifyTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await executeBenchmark();
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  await requireAuth();
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
