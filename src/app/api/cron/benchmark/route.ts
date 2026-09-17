import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Server configuration error: CRON_SECRET is not configured' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const urlToken = request.nextUrl.searchParams.get('token');

  const providedToken = bearerToken || urlToken;

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing cron token' },
      { status: 401 }
    );
  }

  try {
    const tasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmarking executed successfully',
      taskCount: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Error running benchmark cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error executing benchmark job' },
      { status: 500 }
    );
  }
}
