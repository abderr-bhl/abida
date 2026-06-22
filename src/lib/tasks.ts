import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

export async function getTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function updateTaskStatus(id: string, status: 'pending' | 'completed' | 'ignored') {
  try {
    const tasks = await getTasks();
    const updatedTasks = tasks.map((t: Task) =>
      t.id === id ? { ...t, status } : t
    );
    await fs.writeFile(TASKS_FILE, JSON.stringify(updatedTasks, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to update task:', error);
    return false;
  }
}
