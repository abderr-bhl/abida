'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { updateTaskStatus, runCompetitiveBenchmark } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: TaskStatus
): Promise<void> {
  await requireAuth();
  await updateTaskStatus(taskId, newStatus);
  revalidatePath('/admin/tasks');
}

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runCompetitiveBenchmark();
  revalidatePath('/admin/tasks');
}
