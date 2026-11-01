'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runCompetitorBenchmark, updateBenchmarkTaskStatus, getStoredTasks } from '@/lib/automation/benchmark';
import { BenchmarkTask } from '@/types';

export async function fetchTasksAction(): Promise<BenchmarkTask[]> {
  await requireAuth();
  return getStoredTasks();
}

export async function triggerBenchmarkAction(): Promise<{ success: boolean; message: string; count?: number }> {
  await requireAuth();
  try {
    const result = await runCompetitorBenchmark();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      message: `Successfully benchmarked US competitors. Found ${result.articlesFound} articles and generated ${result.newTasksGenerated} new tasks.`,
      count: result.newTasksGenerated,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to execute benchmark',
    };
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: BenchmarkTask['status']
): Promise<{ success: boolean }> {
  await requireAuth();
  const updated = await updateBenchmarkTaskStatus(taskId, newStatus);
  revalidatePath('/admin/tasks');
  return { success: !!updated };
}
