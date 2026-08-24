'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { Task } from '@/types';

export async function triggerBenchmarkAction(): Promise<void> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(formData: FormData): Promise<void> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const taskId = formData.get('taskId') as string;
  const status = formData.get('status') as Task['status'];

  if (taskId && status) {
    await updateTaskStatus(taskId, status);
    revalidatePath('/admin/tasks');
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
