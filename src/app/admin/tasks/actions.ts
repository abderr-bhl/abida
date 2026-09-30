'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAuth, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { runBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateStatusAction(taskId: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  await requireAuth();
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
