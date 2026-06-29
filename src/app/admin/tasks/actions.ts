'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { checkAuth } from '@/lib/auth';
import { getTasks, updateTaskStatus, runBenchmark } from '@/lib/automation/benchmark';
import { Task } from '@/types';

export async function getTasksAction(): Promise<Task[]> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) return [];
  return await getTasks();
}

export async function updateTaskStatusAction(taskId: string, status: Task['status']): Promise<boolean> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) return false;
  return await updateTaskStatus(taskId, status);
}

export async function runBenchmarkAction() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) return null;
  return await runBenchmark();
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
