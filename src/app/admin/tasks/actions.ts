'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmarkEngine, updateTaskStatusInStore, Task } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmarkEngine();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, status: string): Promise<void> {
  await requireAuth();
  await updateTaskStatusInStore(taskId, status as Task['status']);
  revalidatePath('/admin/tasks');
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
