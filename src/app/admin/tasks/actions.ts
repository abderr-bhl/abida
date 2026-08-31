'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus, Task } from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function changeTaskStatus(taskId: string, status: Task['status']): Promise<void> {
  await requireAuth();
  updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
