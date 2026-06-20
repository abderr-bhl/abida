import { NextResponse, NextRequest } from 'next/server';
import * as fs from 'fs/promises';
import path from 'path';
import { checkAuth } from '@/lib/auth';
import { Task } from '@/types';
import { runBenchmark } from '@/lib/automation/benchmark';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

async function loadTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]) {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await loadTasks();
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action, taskId, status } = body;

  if (action === 'trigger') {
    try {
      const result = await runBenchmark();
      return NextResponse.json({ message: 'Benchmark triggered', ...result });
    } catch {
      return NextResponse.json({ error: 'Benchmark failed' }, { status: 500 });
    }
  }

  if (action === 'update' && taskId && status) {
    const tasks = await loadTasks();
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: status as Task['status'] } : t
    );
    await saveTasks(updatedTasks);
    return NextResponse.json({ message: 'Task updated' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
