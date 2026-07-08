'use server';

import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';
import { revalidatePath } from 'next/cache';
import { runBenchmark } from '@/lib/automation/benchmark';
import { checkAuth } from '@/lib/auth';

const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');

export async function updateTaskStatus(id: string, status: Task['status']) {
  if (!(await checkAuth())) throw new Error('Unauthorized');

  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(data);

    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, status } : task
    );

    await fs.writeFile(TASKS_FILE, JSON.stringify(updatedTasks, null, 2));
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Failed to update task status:', error);
  }
}

export async function runBenchmarkAction() {
  if (!(await checkAuth())) throw new Error('Unauthorized');

  await runBenchmark();
  revalidatePath('/admin/tasks');
}
