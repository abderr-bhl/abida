'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmark, loadTasks, saveTasks, BenchmarkTask } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: BenchmarkTask['status']
): Promise<void> {
  await requireAuth();
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
    saveTasks(tasks);
    revalidatePath('/admin/tasks');
  }
}

export async function updateTaskStatusForm(formData: FormData): Promise<void> {
  await requireAuth();
  const taskId = formData.get('taskId')?.toString();
  const newStatus = formData.get('status')?.toString() as BenchmarkTask['status'] | undefined;

  if (taskId && newStatus && ['pending', 'in-progress', 'completed', 'ignored'].includes(newStatus)) {
    const tasks = loadTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].status = newStatus;
      saveTasks(tasks);
      revalidatePath('/admin/tasks');
    }
  }
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
