import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { Task } from '@/types';
import { runBenchmark } from '@/lib/automation/benchmark';

const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!fs.existsSync(TASKS_FILE)) {
    return NextResponse.json([]);
  }

  const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, taskId } = await request.json();

  if (action === 'trigger_benchmark') {
    const record = await runBenchmark();
    return NextResponse.json({ success: true, record });
  }

  if (!fs.existsSync(TASKS_FILE)) {
    return NextResponse.json({ error: 'No tasks found' }, { status: 404 });
  }

  let tasks: Task[] = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));

  if (action === 'update_status') {
    const { status } = await request.json();
    tasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
    try {
      fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EROFS') {
         return NextResponse.json({ success: true, warning: 'Read-only filesystem' });
      }
      throw error;
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
