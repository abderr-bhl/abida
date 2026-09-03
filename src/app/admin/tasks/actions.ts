'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmarkJob, loadTasks, saveData, Task } from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<{ success: boolean; message: string }> {
  await requireAuth();
  const res = await runBenchmarkJob();
  revalidatePath('/admin/tasks');
  return { success: res.success, message: res.message };
}

export async function updateTaskStatus(taskId: string, newStatus: Task['status']): Promise<{ success: boolean }> {
  await requireAuth();
  const tasks = await loadTasks();
  const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
  await saveData(updated);
  revalidatePath('/admin/tasks');
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
