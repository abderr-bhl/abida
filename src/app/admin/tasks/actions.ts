'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runCompetitiveBenchmark, getStoredTasks, saveTasks, BenchmarkTask } from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runCompetitiveBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, newStatus: BenchmarkTask['status']): Promise<void> {
  await requireAuth();
  const tasks = getStoredTasks();
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      return {
        ...task,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return task;
  });
  saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
