import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Task } from '../../../../types';

const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');
const ADMIN_TOKEN = 'demo_admin_token'; // In production, move to process.env.ADMIN_TOKEN

function checkAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${ADMIN_TOKEN}`;
}

async function loadTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) return [];
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const tasks = await loadTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const newTask: Partial<Task> = await request.json();
  const tasks = await loadTasks();

  const task: Task = {
    id: crypto.randomUUID(),
    title: newTask.title || 'New Task',
    description: newTask.description || '',
    status: (newTask.status as Task['status']) || 'pending',
    priority: (newTask.priority as Task['priority']) || 'medium',
    createdAt: new Date().toISOString(),
    category: newTask.category || 'General',
    sourceUrl: newTask.sourceUrl
  };

  tasks.push(task);
  await saveTasks(tasks);
  return NextResponse.json(task);
}

export async function PUT(request: Request) {
  if (!checkAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const updatedTask: Task = await request.json();
  let tasks = await loadTasks();
  tasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
  await saveTasks(tasks);
  return NextResponse.json(updatedTask);
}
