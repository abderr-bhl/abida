'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { runBenchmark as runBenchmarkLib } from '@/lib/automation/benchmark';
import { Task, TaskStatus } from '@/types';
import { checkAuth } from '@/lib/auth';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function getTasks(): Promise<Task[]> {
  if (!await checkAuth()) return [];
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(content) as Task[];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  if (!await checkAuth()) throw new Error('Unauthorized');

  const tasks = await getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex > -1) {
    tasks[taskIndex].status = status;
    try {
      fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
      revalidatePath('/admin/tasks');
      return { success: true };
    } catch (error) {
      console.error('Error saving tasks:', error);
      return { error: 'Failed to save' };
    }
  }
  return { error: 'Task not found' };
}

export async function triggerBenchmark() {
  if (!await checkAuth()) throw new Error('Unauthorized');

  await runBenchmarkLib();
  revalidatePath('/admin/tasks');
  return { success: true };
}
