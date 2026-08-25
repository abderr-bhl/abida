'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { loadTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';
import { requireAuth } from '@/lib/auth';
import { BenchmarkTaskStatus } from '@/types';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, newStatus: BenchmarkTaskStatus): Promise<void> {
  await requireAuth();
  const tasks = loadTasks();
  const updated = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, status: newStatus };
    }
    return task;
  });

  saveTasks(updated);
  revalidatePath('/admin/tasks');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
