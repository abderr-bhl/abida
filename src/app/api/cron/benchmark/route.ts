import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET environment variable is not configured.' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const searchParams = request.nextUrl.searchParams;
  const queryToken = searchParams.get('token');

  const providedToken = bearerToken || queryToken;

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing secret token.' },
      { status: 401 }
    );
  }

  try {
    const newTasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark executed successfully.',
      newTasksCount: newTasks.length,
      newTasks,
    });
  } catch (error) {
    console.error('Error running benchmark cron job:', error);
    return NextResponse.json(
      { error: 'Failed to execute benchmark job.' },
      { status: 500 }
    );
  }
}
