import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'demo_admin_token';

async function checkAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${AUTH_TOKEN}`;
}

export async function GET(request: Request) {
  if (!await checkAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const content = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks = JSON.parse(content);
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PATCH(request: Request) {
  if (!await checkAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    const content = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(content);

    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex >= 0) {
      tasks[taskIndex].status = status;
      await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
