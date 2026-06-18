import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Task } from '@/types';
import { checkAuth } from '@/lib/auth';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!fs.existsSync(TASKS_FILE)) {
    return NextResponse.json([]);
  }
  const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  return NextResponse.json(tasks);
}

export async function PATCH(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, status } = body;

  if (!fs.existsSync(TASKS_FILE)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const tasks: Task[] = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  tasks[taskIndex].status = status;
  tasks[taskIndex].updatedAt = new Date().toISOString();

  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
        return NextResponse.json({ error: 'Filesystem is read-only. In production, use a database.' }, { status: 500 });
    }
    throw error;
  }

  return NextResponse.json(tasks[taskIndex]);
}
