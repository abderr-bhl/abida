'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { loadTasks, saveData, runBenchmark } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
  await requireAuth();
  const tasks = loadTasks();
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, status: newStatus };
    }
    return task;
  });

  saveData(updatedTasks);
  revalidatePath('/admin/tasks');
}
