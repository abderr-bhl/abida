'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import {
  runBenchmark,
  updateTaskStatus,
  deleteTask,
  TaskStatus,
} from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(id: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  await updateTaskStatus(id, status);
  revalidatePath('/admin/tasks');
}

export async function deleteTaskAction(id: string): Promise<void> {
  await requireAuth();
  await deleteTask(id);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  await requireAuth();
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
