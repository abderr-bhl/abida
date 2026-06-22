import { NextRequest, NextResponse } from 'next/server';
import { getTasks, updateTaskStatus } from '@/lib/tasks';
import { runBenchmark } from '@/lib/automation/benchmark';
import { validateAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (!validateAdminToken(request.headers.get('authorization'))) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const tasks = await getTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  if (!validateAdminToken(request.headers.get('authorization'))) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { action, taskId, status } = body;

  if (!action || typeof action !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing or invalid action' }, { status: 400 });
  }

  // Basic URL sanitation and validation if we were handling user-provided URLs
  // In this case, sourceUrl comes from our own benchmarking engine, but it's good practice.

  if (action === 'trigger-benchmark') {
    const newTasks = await runBenchmark();
    return NextResponse.json({ success: true, newTasks });
  }

  if (action === 'update-status' && taskId && status) {
    const success = await updateTaskStatus(taskId, status);
    return NextResponse.json({ success });
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
