'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatusInStore } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types/task';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatusInStore(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  await requireAuth();
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  revalidatePath('/admin/tasks');
  redirect('/admin/login');
}
