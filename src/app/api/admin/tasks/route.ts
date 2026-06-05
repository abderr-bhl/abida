import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '../../../../types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

function checkAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  // For demo purposes, we use a hardcoded secret. In production, use process.env.ADMIN_SECRET
  return authHeader === 'Bearer demo_admin_token';
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks = JSON.parse(data);
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function PATCH(request: Request) {
  if (!checkAuth(request)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(data);

    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    tasks[taskIndex].status = status;
    tasks[taskIndex].updatedAt = new Date().toISOString();

    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));

    return NextResponse.json({ success: true, task: tasks[taskIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
