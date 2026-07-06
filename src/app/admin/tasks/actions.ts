'use server';

import { revalidatePath } from 'next/cache';
import { runBenchmark as triggerBenchmark, updateTaskStatus as setTaskStatus } from '@/lib/automation/benchmark';
import { Task } from '@/types';

export async function runBenchmark() {
  await triggerBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
  await setTaskStatus(taskId, status);
  revalidatePath('/admin/tasks');
}
