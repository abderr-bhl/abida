'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runCompetitorBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { BenchmarkTask } from '@/types';

export async function runBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runCompetitorBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(taskId: string, status: BenchmarkTask['status']): Promise<void> {
  await requireAuth();
  await updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
