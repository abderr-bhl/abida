'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { runCompetitorBenchmark, updateTaskStatus, TaskStatus } from '@/lib/automation/benchmark';
import { requireAuth } from '@/lib/auth';

export async function runBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runCompetitorBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
