'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { runCompetitiveBenchmark, updateTaskStatusInStore, getStoredTasks } from '@/lib/automation/benchmark';
import { Task, TaskStatus } from '@/types/task';

export async function fetchTasksAction(): Promise<Task[]> {
  await requireAuth();
  return getStoredTasks();
}

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runCompetitiveBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(taskId: string, newStatus: TaskStatus): Promise<void> {
  await requireAuth();
  updateTaskStatusInStore(taskId, newStatus);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
