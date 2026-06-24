import { NextRequest, NextResponse } from 'next/server';
import { getTasks, runBenchmark, updateTaskStatus } from '@/lib/automation/benchmark';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await getTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (body.action === 'run_benchmark') {
      const result = await runBenchmark();
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (_error) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { taskId, status } = await request.json();
    if (!taskId || !status) {
      return NextResponse.json({ error: 'Missing taskId or status' }, { status: 400 });
    }

    const success = await updateTaskStatus(taskId, status);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
  } catch (_error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
