'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { getStoredTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';
import { Task, TaskStatus } from '@/types';

export async function getTasksAction(): Promise<Task[]> {
  await requireAuth();
  return getStoredTasks();
}

export async function updateTaskStatusAction(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; message?: string; error?: string }> {
  await requireAuth();

  const taskId = formData.get('taskId')?.toString();
  const status = formData.get('status')?.toString() as TaskStatus;

  if (!taskId || !status) {
    return { success: false, error: 'Task ID and status are required.' };
  }

  const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'dismissed'];
  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Invalid task status.' };
  }

  const tasks = getStoredTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return { success: false, error: 'Task not found.' };
  }

  tasks[taskIndex].status = status;
  saveTasks(tasks);

  revalidatePath('/admin/tasks');
  return { success: true, message: 'Task status updated successfully.' };
}

export async function triggerBenchmarkAction(): Promise<{ success: boolean; newTasksCount: number; message: string }> {
  await requireAuth();

  const result = await runBenchmark();
  revalidatePath('/admin/tasks');

  return {
    success: true,
    newTasksCount: result.newTasksCount,
    message: result.newTasksCount > 0
      ? `Benchmark finished. ${result.newTasksCount} new task(s) generated.`
      : 'Benchmark finished. No new competitor tasks found.',
  };
}
