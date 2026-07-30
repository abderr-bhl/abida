'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import {
  readTasks,
  writeTasks,
  runCompetitiveBenchmark
} from '@/lib/automation/benchmark';
import { BenchmarkRecord } from '@/types';

// Action to update task status
export async function updateTaskStatus(taskId: string, status: 'Pending' | 'In Progress' | 'Completed') {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    throw new Error('Unauthorized access to administrative tasks');
  }

  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = status;
    writeTasks(tasks);
    revalidatePath('/admin/tasks');
  }
}

// Action to manually trigger competitive benchmarking
export async function triggerBenchmark(): Promise<BenchmarkRecord> {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    throw new Error('Unauthorized access to trigger benchmarking');
  }

  const record = await runCompetitiveBenchmark();
  revalidatePath('/admin/tasks');
  return record;
}

// Action to clear / reset all tasks
export async function clearAllTasks() {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    throw new Error('Unauthorized access');
  }

  writeTasks([]);
  revalidatePath('/admin/tasks');
}

// Action to logout admin
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
