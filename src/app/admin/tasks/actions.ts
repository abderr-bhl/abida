'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { getTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';

export async function updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<void> {
  await requireAuth();
  const tasks = getTasks();
  const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
  saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
