import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET environment variable is not configured.' },
      { status: 500 }
    );
  }

  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  const providedToken = bearerToken || tokenQuery;

  if (providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron authentication token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      added: result.added,
      totalTasks: result.tasks.length,
      tasks: result.tasks,
    });
  } catch (error) {
    console.error('Cron benchmark execution failed:', error);
    return NextResponse.json(
      { error: 'Benchmark execution failed.' },
      { status: 500 }
    );
  }
}
