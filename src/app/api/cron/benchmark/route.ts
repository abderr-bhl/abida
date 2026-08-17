import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  const tokenQueryParam = request.nextUrl.searchParams.get('token');

  let providedToken = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7);
  } else if (tokenQueryParam) {
    providedToken = tokenQueryParam;
  }

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      message: 'Benchmark completed successfully',
      newTasksCount: result.newTasksCount,
      totalTasksCount: result.tasks.length,
    });
  } catch (error) {
    console.error('Error running benchmark cron job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || !('action' in body)) {
      return NextResponse.json({ error: 'Bad Request: Missing required field "action"' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  } catch {
    return NextResponse.json({ error: 'Bad Request: Invalid JSON payload' }, { status: 400 });
  }
}
