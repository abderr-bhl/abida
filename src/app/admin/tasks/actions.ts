'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTask } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus
): Promise<{ success: boolean; message: string }> {
  await requireAuth();
  const updated = await updateTask(taskId, status);
  if (!updated) {
    return { success: false, message: 'Task not found or update failed.' };
  }
  revalidatePath('/admin/tasks');
  return { success: true, message: `Task status updated to ${status}` };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
