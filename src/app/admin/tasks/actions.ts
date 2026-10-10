'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus, Task } from '@/lib/automation/benchmark';

export async function triggerBenchmark(): Promise<{ success: boolean; added: number }> {
  await requireAuth();
  const result = await runBenchmark();
  revalidatePath('/admin/tasks');
  return { success: true, added: result.added };
}

export async function changeTaskStatus(
  taskId: string,
  newStatus: Task['status']
): Promise<{ success: boolean }> {
  await requireAuth();
  const updated = await updateTaskStatus(taskId, newStatus);
  revalidatePath('/admin/tasks');
  return { success: !!updated };
}
