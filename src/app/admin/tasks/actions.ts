'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { loadTasks, saveData, runBenchmark, Task } from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<{ success: boolean; added: number; total: number }> {
  await requireAuth();
  const result = await runBenchmark();
  revalidatePath('/admin/tasks');
  return { success: true, ...result };
}

export async function updateTaskStatus(
  taskId: string,
  status: Task['status']
): Promise<{ success: boolean }> {
  await requireAuth();
  const tasks = loadTasks();
  const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
  saveData(updated);
  revalidatePath('/admin/tasks');
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
