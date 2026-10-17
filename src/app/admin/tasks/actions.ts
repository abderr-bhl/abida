'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';
import { revalidatePath } from 'next/cache';

export async function triggerBenchmark(): Promise<{ success: boolean; newTasksCount: number; message: string }> {
  await requireAuth();
  const result = await runBenchmark();
  revalidatePath('/admin/tasks');
  return result;
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}
