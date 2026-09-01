'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus as updateTaskStatusInDb } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<void> {
  await requireAuth();
  await updateTaskStatusInDb(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
