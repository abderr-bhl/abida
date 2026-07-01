'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { checkAuth } from '@/lib/auth';
import { Task } from '@/types';
import { runBenchmark as triggerBenchmark } from '@/lib/automation/benchmark';

const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');

async function getTasks(): Promise<Task[]> {
  try {
    const content = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]): Promise<void> {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
  if (!(await checkAuth())) throw new Error('Unauthorized');

  const tasks = await getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex !== -1) {
    tasks[taskIndex].status = status;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    await saveTasks(tasks);
    revalidatePath('/admin/tasks');
  }
}

export async function runBenchmark() {
  if (!(await checkAuth())) throw new Error('Unauthorized');

  const result = await triggerBenchmark();
  revalidatePath('/admin/tasks');
  return result;
}

export async function fetchTasks() {
  if (!(await checkAuth())) throw new Error('Unauthorized');
  return await getTasks();
}
