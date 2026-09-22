'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';
import { BenchmarkTask, TaskStatus } from '@/types';

export async function getTasksAction(): Promise<BenchmarkTask[]> {
  await requireAuth();
  return getTasks();
}

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: TaskStatus
): Promise<{ success: boolean; message?: string }> {
  await requireAuth();

  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === taskId);

  if (index === -1) {
    return { success: false, message: 'Task not found' };
  }

  tasks[index] = {
    ...tasks[index],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  const saved = saveTasks(tasks);
  revalidatePath('/admin/tasks');

  return {
    success: true,
    message: saved ? 'Task status updated.' : 'Task status updated in memory.',
  };
}

export async function triggerBenchmarkAction(): Promise<{
  success: boolean;
  message: string;
  newTasksCount: number;
}> {
  await requireAuth();

  try {
    const result = await runBenchmark();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      message: `Benchmark complete. Added ${result.newTasksCount} new competitor tasks.`,
      newTasksCount: result.newTasksCount,
    };
  } catch (error) {
    console.error('Failed to trigger manual benchmark:', error);
    return {
      success: false,
      message: 'Failed to run competitive benchmarking.',
      newTasksCount: 0,
    };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
