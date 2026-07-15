'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { Task, TaskStatus } from '@/types';
import { runBenchmarking } from '@/lib/automation/benchmark';
import { checkAuth } from '@/lib/auth';

const DATA_FILE = path.join(process.cwd(), 'data/tasks.json');

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) throw new Error('Unauthorized');

  if (!fs.existsSync(DATA_FILE)) return;

  try {
    const tasks: Task[] = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status } : task
    );
    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedTasks, null, 2), 'utf8');
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Error updating task status:', error);
  }
}

export async function triggerBenchmark() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) throw new Error('Unauthorized');

  try {
    await runBenchmarking();
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Error triggering benchmark:', error);
  }
}
