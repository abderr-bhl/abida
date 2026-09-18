'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { loadTasks, runBenchmarking, updateTaskStatus } from '@/lib/automation/benchmark';
import { BenchmarkTask, TaskStatus } from '@/lib/automation/types';

export async function getTasksAction(): Promise<BenchmarkTask[]> {
  await requireAuth();
  return await loadTasks();
}

export async function triggerBenchmarkAction(): Promise<{ success: boolean; message: string; addedCount: number }> {
  await requireAuth();
  try {
    const result = await runBenchmarking();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      message: `Benchmarking completed. Added ${result.addedCount} new task(s).`,
      addedCount: result.addedCount,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to run benchmark: ${(error as Error).message}`,
      addedCount: 0,
    };
  }
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<{ success: boolean }> {
  await requireAuth();
  const result = await updateTaskStatus(taskId, status);
  if (result) {
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
