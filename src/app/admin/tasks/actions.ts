'use server';

import { checkAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus as updateStatusInDb } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { Task } from '@/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmark(): Promise<void> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized action');
  }

  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(taskId: string, status: Task['status']): Promise<void> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized action');
  }

  await updateStatusInDb(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
