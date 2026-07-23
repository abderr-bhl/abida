'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { checkAuth } from '@/lib/auth';
import { runBenchmarking, readData, saveData } from '@/lib/automation/benchmark';
import { Task } from '@/types';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

// Helper to ensure authorization
async function ensureAuth() {
  const isAuthorized = await checkAuth();
  if (!isAuthorized) {
    throw new Error('Unauthorized');
  }
}

export async function triggerBenchmark(prevState: unknown, formData: FormData) {
  try {
    await ensureAuth();
    // Use parameters to satisfy both useActionState signature and ESLint unused variable rules
    console.log('triggerBenchmark invoked. State:', !!prevState, 'FormData exists:', !!formData);

    const result = await runBenchmarking();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      message: `Benchmark completed. Created ${result.tasksCreatedCount} tasks.`,
      error: result.error
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to trigger benchmark.'
    };
  }
}

export async function updateTaskStatus(prevState: unknown, formData: FormData) {
  try {
    await ensureAuth();
    // Use parameter to satisfy ESLint
    console.log('updateTaskStatus invoked. PrevState exists:', !!prevState);

    const taskId = formData.get('taskId') as string;
    const newStatus = formData.get('status') as Task['status'];

    if (!taskId || !newStatus) {
      return { success: false, error: 'Task ID and status are required.' };
    }

    const tasks = readData<Task[]>(TASKS_FILE, []);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return { success: false, error: 'Task not found.' };
    }

    tasks[taskIndex].status = newStatus;
    saveData(TASKS_FILE, tasks);

    revalidatePath('/admin/tasks');
    return { success: true, message: `Task status updated to ${newStatus}.` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update task status.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
