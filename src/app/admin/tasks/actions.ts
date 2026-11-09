'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth, ADMIN_COOKIE_NAME } from '@/lib/auth';
import {
  runCompetitorBenchmark,
  getStoredTasks,
  saveStoredTasks,
} from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function runBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runCompetitorBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: TaskStatus
): Promise<void> {
  await requireAuth();
  const tasks = await getStoredTasks();
  const updatedTasks = tasks.map(t => {
    if (t.id === taskId) {
      return {
        ...t,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return t;
  });

  await saveStoredTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
