'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(
  taskId: string,
  status: 'pending' | 'in-progress' | 'completed'
): Promise<void> {
  await requireAuth();
  updateTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusFormAction(formData: FormData): Promise<void> {
  await requireAuth();
  const taskId = formData.get('taskId')?.toString();
  const status = formData.get('status')?.toString() as 'pending' | 'in-progress' | 'completed';

  if (taskId && status && ['pending', 'in-progress', 'completed'].includes(status)) {
    updateTaskStatus(taskId, status);
    revalidatePath('/admin/tasks');
  }
}

export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
