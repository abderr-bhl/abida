'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatusInStore, TaskStatus } from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<{ success: boolean; message: string; addedCount?: number }> {
  await requireAuth();
  try {
    const res = await runBenchmark();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      message: `Benchmark completed. Found and added ${res.addedCount} new task(s).`,
      addedCount: res.addedCount,
    };
  } catch (err: unknown) {
    console.error('Manual benchmark trigger failed:', err);
    return {
      success: false,
      message: 'Failed to run benchmark execution.',
    };
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<{ success: boolean }> {
  await requireAuth();
  const updated = await updateTaskStatusInStore(taskId, status);
  if (updated) {
    revalidatePath('/admin/tasks');
    return { success: true };
  }
  return { success: false };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
