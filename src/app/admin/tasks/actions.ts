'use server';

import { requireAuth } from '@/lib/auth';
import { loadTasks, saveTasks, runCompetitiveBenchmark, Task } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';

export async function getTasks(): Promise<Task[]> {
  await requireAuth();
  return await loadTasks();
}

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  try {
    await runCompetitiveBenchmark();
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Failed to run benchmark action:', error);
  }
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
  await requireAuth();
  const tasks = await loadTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = status;
    await saveTasks(tasks);
    revalidatePath('/admin/tasks');
  }
}
