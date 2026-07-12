'use server';

import { revalidatePath } from 'next/cache';
import { runBenchmark as triggerBenchmark, updateTaskStatus as updateStatus } from '@/lib/automation/benchmark';
import { Task } from '@/types';
import { checkAuth } from '@/lib/auth';

export async function runBenchmark() {
  if (!await checkAuth()) throw new Error('Unauthorized');
  await triggerBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
  if (!await checkAuth()) throw new Error('Unauthorized');
  updateStatus(taskId, status);
  revalidatePath('/admin/tasks');
}
