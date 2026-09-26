'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { getTasks, saveTasks, runBenchmark, TaskStatus } from '@/lib/automation/benchmark';

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}

export async function triggerBenchmark(): Promise<{ success: boolean; message: string }> {
  await requireAuth();
  try {
    const result = await runBenchmark();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      message: `Benchmark complete. ${result.addedCount} new competitor tasks identified.`,
    };
  } catch (error) {
    console.error('Error triggering benchmark:', error);
    return {
      success: false,
      message: 'Failed to run benchmark action.',
    };
  }
}

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<{ success: boolean }> {
  await requireAuth();
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) {
    return { success: false };
  }

  tasks[index].status = newStatus;
  saveTasks(tasks);
  revalidatePath('/admin/tasks');
  return { success: true };
}
