'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { runBenchmark, updateTaskStatus, BenchmarkTask } from '@/lib/automation/benchmark';

export async function triggerBenchmarkAction(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatusAction(formData: FormData): Promise<void> {
  await requireAuth();

  const id = formData.get('id') as string | null;
  const status = formData.get('status') as BenchmarkTask['status'] | null;

  if (id && status) {
    await updateTaskStatus(id, status);
    revalidatePath('/admin/tasks');
  }
}
