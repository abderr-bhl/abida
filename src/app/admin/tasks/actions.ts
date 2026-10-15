'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus as updateTaskStatusInDb } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { logoutAction as authLogoutAction } from '@/app/admin/login/actions';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(taskId: string, status: string): Promise<void> {
  await requireAuth();
  await updateTaskStatusInDb(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAdmin(): Promise<void> {
  await requireAuth();
  await authLogoutAction();
}
