'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ADMIN_COOKIE_NAME, requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus, TaskStatus } from '@/lib/automation/benchmark';

export async function runBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(taskId: string, newStatus: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatus(taskId, newStatus);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
