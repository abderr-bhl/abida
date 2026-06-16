import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkAuth } from '@/lib/auth';
import { Task } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');

export async function GET() {
  if (!(await checkAuth())) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    if (fs.existsSync(TASKS_FILE)) {
      const content = fs.readFileSync(TASKS_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(content));
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await checkAuth())) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    if (fs.existsSync(TASKS_FILE)) {
      const content = fs.readFileSync(TASKS_FILE, 'utf-8');
      const tasks: Task[] = JSON.parse(content);

      const taskIdx = tasks.findIndex(t => t.id === id);
      if (taskIdx > -1) {
        tasks[taskIdx].status = status;
        tasks[taskIdx].updatedAt = new Date().toISOString();

        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
        return NextResponse.json(tasks[taskIdx]);
      }
    }

    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
