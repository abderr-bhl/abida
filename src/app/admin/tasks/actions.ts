'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { runCompetitorBenchmark, loadTasks, saveTasks } from '@/lib/automation/benchmark';
import { checkAuth } from '@/lib/auth';

export async function triggerBenchmarkAction(): Promise<void> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  await runCompetitorBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(formData: FormData): Promise<void> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const taskId = formData.get('taskId') as string;
  const status = formData.get('status') as 'pending' | 'in_progress' | 'completed';

  if (!taskId || !status) {
    return;
  }

  const tasks = loadTasks();
  const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
  saveTasks(updated);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
