import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

async function getTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (_error) {
    return [];
  }
}

async function saveTasks(tasks: Task[]): Promise<void> {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function GET() {
  const tasks = await getTasks();
  return NextResponse.json(tasks);
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex > -1) {
      tasks[taskIndex].status = status;
      await saveTasks(tasks);
      return NextResponse.json(tasks[taskIndex]);
    }

    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
