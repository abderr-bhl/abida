'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { loadTasks, updateTaskStatusInStore, runBenchmark } from '@/lib/automation/benchmark';
import { Task, TaskStatus } from '@/types';

export async function getTasksAction(): Promise<Task[]> {
  await requireAuth();
  return loadTasks();
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatusInStore(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}
