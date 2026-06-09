import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Task } from '../../../../types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

function loadTasks(): Task[] {
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function GET() {
  const tasks = loadTasks();
  return NextResponse.json(tasks);
}

export async function PATCH(request: Request) {
  try {
    const { id, status, priority } = await request.json();
    const tasks = loadTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (status) tasks[taskIndex].status = status;
    if (priority) tasks[taskIndex].priority = priority;

    saveTasks(tasks);
    return NextResponse.json(tasks[taskIndex]);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const tasks = loadTasks();
  const updatedTasks = tasks.filter(t => t.id !== id);
  saveTasks(updatedTasks);

  return NextResponse.json({ success: true });
}
