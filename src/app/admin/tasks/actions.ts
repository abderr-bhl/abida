'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { runBenchmark as runBenchmarkLogic } from '@/lib/automation/benchmark';
import { checkAuth } from '@/lib/auth';
import { TaskStatus, Task } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

export async function getTasks(): Promise<Task[]> {
  if (!(await checkAuth())) return [];
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  if (!(await checkAuth())) throw new Error('Unauthorized');

  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    let tasks: Task[] = JSON.parse(data);
    tasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Update status failed:', error);
    throw error;
  }
}

export async function runBenchmark() {
  if (!(await checkAuth())) throw new Error('Unauthorized');

  try {
    const record = await runBenchmarkLogic();
    revalidatePath('/admin/tasks');
    return record;
  } catch (error) {
    console.error('Benchmark failed:', error);
    throw error;
  }
}
