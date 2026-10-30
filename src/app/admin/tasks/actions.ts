'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus, TaskStatus } from '@/lib/automation/benchmark';

export async function triggerBenchmarkAction(): Promise<{ success: boolean; newTasksCount: number; message: string }> {
  await requireAuth();
  try {
    const result = await runBenchmark();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      newTasksCount: result.newTasksCount,
      message: `Benchmark complete. Identified ${result.newTasksCount} new competitor task(s).`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to execute benchmark action.';
    return {
      success: false,
      newTasksCount: 0,
      message: msg,
    };
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: TaskStatus
): Promise<{ success: boolean }> {
  await requireAuth();
  try {
    const updated = await updateTaskStatus(taskId, newStatus);
    revalidatePath('/admin/tasks');
    return { success: Boolean(updated) };
  } catch {
    return { success: false };
  }
}
