import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';

const DATA_PATH = path.join(process.cwd(), 'data/tasks.json');

async function loadTasks(): Promise<Task[]> {
  try {
    const content = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2));
}

export async function GET() {
  const tasks = await loadTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const tasks = await loadTasks();
  const newTask = await request.json();

  const task: Task = {
    ...newTask,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.push(task);
  await saveTasks(tasks);
  return NextResponse.json(task);
}

export async function PATCH(request: Request) {
  const tasks = await loadTasks();
  const updates = await request.json();
  const { id, ...rest } = updates;

  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  tasks[index] = { ...tasks[index], ...rest, updatedAt: new Date().toISOString() };
  await saveTasks(tasks);
  return NextResponse.json(tasks[index]);
}
