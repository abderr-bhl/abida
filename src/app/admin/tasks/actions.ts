'use server';

import { checkAuth } from '@/lib/auth';
import { runBenchmarking, getTasks, saveTasks, ContentTask } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function triggerBenchmarkAction(): Promise<{ success: boolean; count: number; error?: string }> {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    throw new Error('Unauthorized');
  }

  try {
    const result = await runBenchmarking();
    revalidatePath('/admin/tasks');
    return { success: true, count: result.count };
  } catch (err) {
    console.error('Manual benchmark trigger failed:', err);
    return { success: false, count: 0, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateTaskStatusAction(taskId: string, status: ContentTask['status']): Promise<{ success: boolean; error?: string }> {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    throw new Error('Unauthorized');
  }

  try {
    const tasks = getTasks();
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status };
      }
      return t;
    });

    saveTasks(updatedTasks);
    revalidatePath('/admin/tasks');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
