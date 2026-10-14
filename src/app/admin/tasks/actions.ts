'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, getTasks, saveTasks } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  const tasks = getTasks();
  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, status };
    }
    return task;
  });
  saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}
