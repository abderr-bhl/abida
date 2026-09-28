'use server';

import { requireAuth } from '@/lib/auth';
import { getTasks, saveTasks, runBenchmark, Task } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  try {
    await runBenchmark();
    revalidatePath('/admin/tasks');
  } catch (err) {
    console.error('Error triggering benchmark:', err);
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed'
): Promise<void> {
  await requireAuth();
  const tasks = getTasks();
  const updatedTasks: Task[] = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, status };
    }
    return task;
  });

  saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
