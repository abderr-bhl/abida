'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { runBenchmark, updateTaskStatusInDb } from '@/lib/automation/benchmark';

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed'
): Promise<void> {
  await requireAuth();
  updateTaskStatusInDb(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
