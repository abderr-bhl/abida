'use server';

import { checkAuth } from '@/lib/auth';
import { runBenchmark as triggerBenchmark } from '@/lib/automation/benchmark';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';
import { revalidatePath } from 'next/cache';

const DATA_FILE = path.join(process.cwd(), 'data', 'tasks.json');

async function ensureData() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export async function getTasks(): Promise<Task[]> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) return [];

  await ensureData();
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) throw new Error('Unauthorized');

  const tasks = await getTasks();
  const updatedTasks = tasks.map(t =>
    t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t
  );

  await fs.writeFile(DATA_FILE, JSON.stringify(updatedTasks, null, 2));
  revalidatePath('/admin/tasks');
}

export async function runBenchmarkAction() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) throw new Error('Unauthorized');

  await triggerBenchmark();
  revalidatePath('/admin/tasks');
}
