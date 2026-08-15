'use server';

import { checkAuth } from '@/lib/auth';
import { getTasks, saveData, runCompetitorBenchmark, TaskItem } from '@/lib/automation/benchmark';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateTaskStatusAction(taskId: string, newStatus: TaskItem['status']) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }

  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    saveData(tasks);
    revalidatePath('/admin/tasks');
  }
}

export async function triggerBenchmarkAction() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }

  const res = await runCompetitorBenchmark();
  revalidatePath('/admin/tasks');
  return res;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
