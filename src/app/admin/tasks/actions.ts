'use server';

import { runBenchmark as runBenchmarkAction } from '@/lib/automation/benchmark';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';
import { checkAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function runBenchmark() {
  if (!(await checkAuth())) throw new Error('Unauthorized');
  const result = await runBenchmarkAction();
  revalidatePath('/admin/tasks');
  return result;
}

export async function getTasks(): Promise<Task[]> {
  if (!(await checkAuth())) throw new Error('Unauthorized');
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
  if (!(await checkAuth())) throw new Error('Unauthorized');
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(data);
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t
    );
    await fs.writeFile(TASKS_FILE, JSON.stringify(updatedTasks, null, 2));
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Failed to update task:', error);
  }
}
