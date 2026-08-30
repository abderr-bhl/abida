import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  const { searchParams } = new URL(request.url);
  const tokenFromQuery = searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing token' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark completed successfully. ${result.tasksCreated} new tasks created.`,
      tasksCreated: result.tasksCreated,
      totalTasks: result.tasks.length,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Benchmark execution failed', details: errorMessage },
      { status: 500 }
    );
  }
}
