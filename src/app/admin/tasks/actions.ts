'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getTasks, saveTasks, runBenchmark, Task } from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<{ success: boolean; message: string }> {
  await requireAuth();

  try {
    const result = await runBenchmark();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      message: `Benchmark completed! Added ${result.addedTasksCount} new competitive task(s).`,
    };
  } catch (error) {
    console.error('Failed to run benchmark action:', error);
    return {
      success: false,
      message: 'Failed to complete competitive benchmark.',
    };
  }
}

export async function updateTaskStatus(taskId: string, newStatus: Task['status']): Promise<void> {
  await requireAuth();

  const tasks = getTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, status: newStatus } : task
  );

  saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
