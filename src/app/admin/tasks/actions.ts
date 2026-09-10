'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(id: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatus(id, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
