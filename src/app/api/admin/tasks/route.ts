import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Task } from '@/types';
import { checkAuth, unauthorizedResponse } from '@/lib/auth';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
  }
}

async function loadTasks(): Promise<Task[]> {
  ensureDataFile();
  const data = fs.readFileSync(TASKS_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'EROFS') {
      throw error;
    }
  }
}

export async function GET(request: Request) {
  if (!checkAuth(request)) return unauthorizedResponse();
  try {
    const tasks = await loadTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAuth(request)) return unauthorizedResponse();
  try {
    const { taskId, status } = await request.json();
    const tasks = await loadTasks();

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    tasks[taskIndex].status = status;
    await saveTasks(tasks);

    return NextResponse.json({ success: true, task: tasks[taskIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
