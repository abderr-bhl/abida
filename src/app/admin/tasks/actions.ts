'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getTasks, saveTasks, runBenchmark, CompetitorTask } from '@/lib/automation/benchmark';

async function checkAuth(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken || token !== adminToken) {
    redirect('/admin/login');
  }
}

export async function triggerBenchmark(): Promise<void> {
  await checkAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: CompetitorTask['status']
): Promise<void> {
  await checkAuth();
  const tasks = await getTasks();
  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return task;
  });
  await saveTasks(updatedTasks);
  revalidatePath('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
