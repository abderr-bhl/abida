'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { Task, TaskStatus } from '@/types';
import { runBenchmark as triggerBenchmark } from '@/lib/automation/benchmark';
import { checkAuth } from '@/lib/auth';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

export async function getTasks(): Promise<Task[]> {
  if (!(await checkAuth())) {
    throw new Error('Unauthorized');
  }

  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  if (!(await checkAuth())) {
    throw new Error('Unauthorized');
  }

  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(data);
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status } : task
    );
    await fs.writeFile(TASKS_FILE, JSON.stringify(updatedTasks, null, 2));
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Failed to update task status:', error);
    throw error;
  }
}

export async function runBenchmark() {
  if (!(await checkAuth())) {
    throw new Error('Unauthorized');
  }

  const record = await triggerBenchmark();
  revalidatePath('/admin/tasks');
  return record;
}
