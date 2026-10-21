'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  try {
    await runBenchmark();
    revalidatePath('/admin/tasks');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Benchmark failed:', error.message);
    }
  }
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<{ success: boolean }> {
  await requireAuth();
  const updated = await updateTaskStatus(taskId, status);
  if (updated) {
    revalidatePath('/admin/tasks');
    return { success: true };
  }
  return { success: false };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
