'use server';

import { checkAuth } from '@/lib/auth';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Task } from '@/types';
import { runBenchmark as triggerBenchmark } from '@/lib/automation/benchmark';
import { revalidatePath } from 'next/cache';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

async function readTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (_error) {
    return [];
  }
}

async function saveTasks(tasks: Task[]) {
  try {
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
}

export async function getTasks() {
  if (!(await checkAuth())) throw new Error('Unauthorized');
  return await readTasks();
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
  if (!(await checkAuth())) throw new Error('Unauthorized');

  const tasks = await readTasks();
  const index = tasks.findIndex(t => t.id === taskId);

  if (index !== -1) {
    tasks[index].status = status;
    tasks[index].updatedAt = new Date().toISOString();
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
