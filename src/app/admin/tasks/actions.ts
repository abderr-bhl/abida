'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { Task, TaskStatus } from '@/types';
import { runBenchmark } from '@/lib/automation/benchmark';
import { isAuthenticated } from '@/lib/auth';

const DATA_FILE = path.join(process.cwd(), 'data', 'tasks.json');

async function checkAuth() {
  if (!(await isAuthenticated())) {
    throw new Error('Unauthorized');
  }
}

export async function getTasks(): Promise<Task[]> {
  await checkAuth();
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  await checkAuth();
  const tasks = await getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = status;
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
    revalidatePath('/admin/tasks');
  }
}

export async function triggerBenchmark() {
  await checkAuth();
  await runBenchmark();
  revalidatePath('/admin/tasks');
}
