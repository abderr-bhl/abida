'use server';

import { clearAdminCookie, requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatusInStore } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';
import { revalidatePath } from 'next/cache';

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatusInStore(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminCookie();
  revalidatePath('/admin/tasks');
}
