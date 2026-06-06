import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Task } from '../../../../types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer demo_admin_token') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return NextResponse.json([]);
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(data);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer demo_admin_token') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { taskId, status } = await request.json();

    if (!fs.existsSync(TASKS_FILE)) {
      return NextResponse.json({ error: 'Tasks file not found' }, { status: 404 });
    }

    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(data);

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    tasks[taskIndex].status = status;

    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));

    return NextResponse.json({ success: true, task: tasks[taskIndex] });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
