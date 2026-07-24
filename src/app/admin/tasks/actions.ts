'use server';

import { checkAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { runBenchmarkEngine, readTasksFile, writeTasksFile } from '@/lib/automation/benchmark';
import { Task } from '@/types';

async function enforceAuth() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized access');
  }
}

export async function getTasks() {
  await enforceAuth();
  try {
    return await readTasksFile();
  } catch (err) {
    console.error('Failed to get tasks:', err);
    return [];
  }
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
  await enforceAuth();

  try {
    const tasks = await readTasksFile();
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, status };
      }
      return t;
    });

    await writeTasksFile(updatedTasks);
    revalidatePath('/admin/tasks');
    return { success: true };
  } catch (err) {
    console.error('Failed to update task status:', err);
    return { success: false, error: 'Could not update task status.' };
  }
}

export async function triggerBenchmark() {
  await enforceAuth();

  try {
    const result = await runBenchmarkEngine();
    revalidatePath('/admin/tasks');
    return { success: true, count: result.tasksCreatedCount };
  } catch (err) {
    console.error('Failed to trigger benchmark:', err);
    return { success: false, error: 'Could not run benchmark.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
