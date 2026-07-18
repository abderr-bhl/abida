'use server';

import { checkAuth } from '@/lib/auth';
import { runBenchmark, getTasks, saveTasksData } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmark() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }

  const record = await runBenchmark();
  revalidatePath('/admin/tasks');
  return record;
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'completed') {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }

  const tasks = getTasks();
  const updated = tasks.map(t => t.id === taskId ? { ...t, status } : t);
  saveTasksData(updated);
  revalidatePath('/admin/tasks');
  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}

export async function fetchTasksAction() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }
  return getTasks();
}
