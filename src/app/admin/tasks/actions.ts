'use server';

import { requireAuth } from '@/lib/auth';
import { loadTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  await requireAuth();
  const tasks = loadTasks();
  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        status,
        updatedAt: new Date().toISOString(),
      };
    }
    return task;
  });

  saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function logoutAdmin(): Promise<void> {
  await requireAuth();
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
