'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { TaskStatus } from '@/types';

export async function triggerBenchmark(): Promise<{ success: boolean; addedCount: number; message: string }> {
  await requireAuth();
  try {
    const result = await runBenchmark();
    revalidatePath('/admin/tasks');
    return {
      success: true,
      addedCount: result.addedCount,
      message: `Benchmark completed. Found ${result.addedCount} new task(s).`
    };
  } catch (error: unknown) {
    console.error('Error triggering benchmark:', error);
    return {
      success: false,
      addedCount: 0,
      message: 'Failed to run benchmark.'
    };
  }
}

export async function updateStatusAction(id: string, status: TaskStatus): Promise<{ success: boolean }> {
  await requireAuth();
  try {
    const updated = await updateTaskStatus(id, status);
    if (updated) {
      revalidatePath('/admin/tasks');
      return { success: true };
    }
    return { success: false };
  } catch (error: unknown) {
    console.error(`Error updating task status for ${id}:`, error);
    return { success: false };
  }
}
