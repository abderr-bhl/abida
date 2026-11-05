'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import {
  getTasks,
  updateTaskStatus,
  runCompetitiveBenchmark,
} from '@/lib/automation/benchmark';
import { BenchmarkTask, TaskStatus } from '@/types/benchmark';

export async function fetchTasksAction(): Promise<BenchmarkTask[]> {
  await requireAuth();
  return getTasks();
}

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus
): Promise<BenchmarkTask | null> {
  await requireAuth();
  const updated = await updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
  return updated;
}

export async function triggerBenchmarkAction(): Promise<{
  scanned: number;
  newTasks: number;
}> {
  await requireAuth();
  const result = await runCompetitiveBenchmark();
  revalidatePath('/admin/tasks');
  return {
    scanned: result.scanned,
    newTasks: result.newTasks,
  };
}
