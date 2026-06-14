import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { checkAuth } from '@/lib/auth';
import { Task } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

async function getTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]): Promise<void> {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function GET(req: NextRequest) {
  if (!await checkAuth(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const tasks = await getTasks();
  return NextResponse.json(tasks);
}

export async function PATCH(req: NextRequest) {
  if (!await checkAuth(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    tasks[taskIndex].status = status;
    await saveTasks(tasks);

    return NextResponse.json(tasks[taskIndex]);
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
