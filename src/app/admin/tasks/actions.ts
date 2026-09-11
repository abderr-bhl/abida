'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { loadTasks, saveTasks, runCompetitiveBenchmarking } from '@/lib/automation/benchmark';
import { Task, TaskStatus } from '@/types/task';

export async function fetchTasksAction(): Promise<Task[]> {
  await requireAuth();
  return loadTasks();
}

export async function triggerBenchmarkAction(): Promise<{ success: boolean; newTasksCount: number; errors: string[] }> {
  await requireAuth();
  const result = await runCompetitiveBenchmarking();
  revalidatePath('/admin/tasks');
  return {
    success: true,
    newTasksCount: result.newTasksCount,
    errors: result.errors,
  };
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<{ success: boolean }> {
  await requireAuth();
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex !== -1) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      status,
      updatedAt: new Date().toISOString(),
    };
    saveTasks(tasks);
    revalidatePath('/admin/tasks');
    return { success: true };
  }

  return { success: false };
}
