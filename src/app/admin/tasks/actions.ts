'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, getStoredTasks, saveTasks, TaskItem } from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, newStatus: TaskItem['status']): Promise<void> {
  await requireAuth();
  const tasks = getStoredTasks();
  const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
  saveTasks(updated);
  revalidatePath('/admin/tasks');
}

export async function logout(): Promise<void> {
  await requireAuth();
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
