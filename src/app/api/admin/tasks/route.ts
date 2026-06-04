import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

async function loadTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]) {
  try {
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
       console.warn('Read-only filesystem, tasks not saved permanently');
    } else {
       throw error;
    }
  }
}

export async function GET() {
  const tasks = await loadTasks();
  return NextResponse.json(tasks);
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const tasks = await loadTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    tasks[taskIndex].status = status;
    await saveTasks(tasks);

    return NextResponse.json(tasks[taskIndex]);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
