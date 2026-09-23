'use server';

import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatusInStore } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(formData: FormData): Promise<void> {
  await requireAuth();
  const taskId = formData.get('taskId') as string;
  const status = formData.get('status') as 'pending' | 'in_progress' | 'completed';

  if (taskId && status) {
    updateTaskStatusInStore(taskId, status);
    revalidatePath('/admin/tasks');
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
