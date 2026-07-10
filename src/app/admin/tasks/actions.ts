'use server';

import * as fs from 'fs/promises';
import * as path from 'path';
import { revalidatePath } from 'next/cache';
import { Task, TaskStatus } from '@/types';
import { runBenchmark } from '@/lib/automation/benchmark';
import { checkAuth } from '@/lib/auth';

const DATA_PATH = path.join(process.cwd(), 'data/tasks.json');

async function ensureAuth() {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');
}

export async function getTasks(): Promise<Task[]> {
  await ensureAuth();
  try {
    const content = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  await ensureAuth();
  try {
    const content = await fs.readFile(DATA_PATH, 'utf-8');
    const tasks: Task[] = JSON.parse(content);

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      tasks[taskIndex].status = status;
      tasks[taskIndex].updatedAt = new Date().toISOString();

      await fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2));
      revalidatePath('/admin/tasks');
    }
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

export async function triggerBenchmark() {
  await ensureAuth();
  try {
    await runBenchmark();
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Benchmark trigger failed:', error);
  }
}
