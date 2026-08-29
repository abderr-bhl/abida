'use server';

import { requireAuth, logout } from '@/lib/auth';
import { runBenchmark, updateTaskStatus, getTasks, AutomatedTask } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function fetchTasksAction(): Promise<AutomatedTask[]> {
  await requireAuth();
  return getTasks();
}

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateStatusAction(taskId: string, status: AutomatedTask['status']): Promise<void> {
  await requireAuth();
  updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect('/admin/login');
}
