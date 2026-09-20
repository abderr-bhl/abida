'use server';

import { requireAuth } from '@/lib/auth';
import { loadTasks, saveTasks, runBenchmark, BenchmarkTask } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';

export async function fetchTasks(): Promise<BenchmarkTask[]> {
  await requireAuth();
  return loadTasks();
}

export async function triggerBenchmark(): Promise<{ success: boolean; count: number; message: string }> {
  await requireAuth();
  const tasks = await runBenchmark();
  revalidatePath('/admin/tasks');
  return {
    success: true,
    count: tasks.length,
    message: 'Benchmark job executed successfully.'
  };
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: 'pending' | 'in_progress' | 'completed'
): Promise<void> {
  await requireAuth();
  const tasks = loadTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = newStatus;
    tasks[index].updatedAt = new Date().toISOString();
    saveTasks(tasks);
    revalidatePath('/admin/tasks');
  }
}
