'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import { readTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';
import { Task } from '@/types';

async function verifyAuthOrThrow() {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    throw new Error('Unauthorized');
  }
}

export async function triggerBenchmarkAction(): Promise<{ success: boolean; tasksCreatedCount: number; error?: string }> {
  await verifyAuthOrThrow();
  const result = await runBenchmark();
  revalidatePath('/admin/tasks');
  return result;
}

export async function updateTaskStatusAction(taskId: string, status: Task['status']): Promise<{ success: boolean; error?: string }> {
  await verifyAuthOrThrow();
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' };
  }
  tasks[taskIndex].status = status;
  const saved = saveTasks(tasks);
  if (!saved) {
    return { success: false, error: 'Failed to write task status updates due to local storage issues.' };
  }
  revalidatePath('/admin/tasks');
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
