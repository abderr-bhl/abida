'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runCompetitorBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runCompetitorBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}
