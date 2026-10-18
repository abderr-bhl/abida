'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { updateTaskStatusInFile, runBenchmark } from '@/lib/automation/benchmark';
import { logoutAction as authLogoutAction } from '@/app/admin/login/actions';
import { TaskStatus } from '@/types';

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatusInFile(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function handleLogoutAction(): Promise<void> {
  await authLogoutAction();
}
