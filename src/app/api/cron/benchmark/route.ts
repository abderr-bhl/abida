import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: 'CRON_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const tokenParam = request.nextUrl.searchParams.get('token');

  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (tokenParam) {
    token = tokenParam;
  }

  if (!token || token !== cronSecret) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid or missing token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      newTasksCount: result.newTasksCount,
      tasks: result.tasks,
    });
  } catch (error: unknown) {
    console.error('Error running automated cron benchmark:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run benchmark task.' },
      { status: 500 }
    );
  }
}
