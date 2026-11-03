'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus, loadTasks } from '@/lib/automation/benchmark';
import { BenchmarkTask, BenchmarkTaskStatus } from '@/types';

export async function getTasksAction(): Promise<BenchmarkTask[]> {
  await requireAuth();
  return loadTasks();
}

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: BenchmarkTaskStatus
): Promise<{ success: boolean }> {
  await requireAuth();
  const updated = updateTaskStatus(taskId, newStatus);
  if (updated) {
    revalidatePath('/admin/tasks');
    return { success: true };
  }
  return { success: false };
}
