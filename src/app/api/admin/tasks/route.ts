import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark, getTasks } from '@/lib/automation/benchmark';
import { isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!(await isAdmin(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await getTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!(await isAdmin(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (body.action === 'run-benchmark') {
      const result = await runBenchmark();
      return NextResponse.json({ success: true, ...result });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (_error) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
