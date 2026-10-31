'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runCompetitorBenchmark, updateTaskStatus, loadTasks } from '@/lib/automation/benchmark';
import { TaskStatus, BenchmarkTask } from '@/types';

export async function fetchTasksAction(): Promise<BenchmarkTask[]> {
  await requireAuth();
  return loadTasks();
}

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();

  try {
    await runCompetitorBenchmark();
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Trigger benchmark error:', error);
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus
): Promise<{ success: boolean; task?: BenchmarkTask | null }> {
  await requireAuth();

  const updated = updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');

  return {
    success: Boolean(updated),
    task: updated,
  };
}
