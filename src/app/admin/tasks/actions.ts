'use server';

import { checkAuth, logout } from '@/lib/auth';
import { runBenchmark } from '@/lib/automation/benchmark';
import { Task, TaskStatus } from '@/types';
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function triggerBenchmark() {
  if (!(await checkAuth())) throw new Error('Unauthorized');

  await runBenchmark();
  revalidatePath('/admin/tasks');
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  if (!(await checkAuth())) throw new Error('Unauthorized');

  if (fs.existsSync(TASKS_FILE)) {
    const tasks: Task[] = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      tasks[taskIndex].status = status;
      tasks[taskIndex].updatedAt = new Date().toISOString();
      fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
      revalidatePath('/admin/tasks');
    }
  }
}

export async function logoutAction() {
  await logout();
  redirect('/admin/login');
}
