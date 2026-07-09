'use server';

import fs from 'fs';
import path from 'path';
import { Task } from '@/types';
import { checkAuth, logout } from '@/lib/auth';
import { runBenchmark } from '@/lib/automation/benchmark';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

async function ensureAuthenticated() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    throw new Error('Unauthorized');
  }
}

export async function getTasks(): Promise<Task[]> {
  await ensureAuthenticated();
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(content) as Task[];
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}

export async function triggerBenchmark() {
  await ensureAuthenticated();
  const result = await runBenchmark();
  revalidatePath('/admin/tasks');
  return result;
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
  await ensureAuthenticated();
  if (!fs.existsSync(TASKS_FILE)) return;

  try {
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    const tasks = JSON.parse(content) as Task[];
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t
    );

    fs.writeFileSync(TASKS_FILE, JSON.stringify(updatedTasks, null, 2));
    revalidatePath('/admin/tasks');
  } catch (error) {
    console.error('Error updating task status:', error);
    throw new Error('Failed to update task');
  }
}

export async function handleLogout() {
  await logout();
  redirect('/admin/login');
}
