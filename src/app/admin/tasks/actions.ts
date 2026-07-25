'use server';

import { checkAuth } from '@/lib/auth';
import { loadTasks, saveData, runBenchmark, loadHistory } from '@/lib/automation/benchmark';
import { Task } from '@/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getTasksAction() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized access', tasks: [] };
  }
  const tasks = await loadTasks();
  return { success: true, tasks };
}

export async function getHistoryAction() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized access', history: null };
  }
  const history = await loadHistory();
  return { success: true, history };
}

export async function updateTaskStatusAction(taskId: string, status: Task['status']) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized access' };
  }

  const tasks = await loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' };
  }

  tasks[taskIndex].status = status;
  tasks[taskIndex].updatedAt = new Date().toISOString();

  const saved = await saveData(tasks);
  if (!saved) {
    return { success: false, error: 'Failed to save task update. (Read-only filesystem or IO error)' };
  }

  revalidatePath('/admin/tasks');
  return { success: true };
}

export async function triggerBenchmarkAction() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized access' };
  }

  try {
    const record = await runBenchmark();
    revalidatePath('/admin/tasks');
    return { success: true, record };
  } catch (err) {
    console.error('Manual benchmark trigger error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
