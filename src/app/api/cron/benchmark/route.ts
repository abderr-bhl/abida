import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');

  let providedToken: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7).trim();
  } else if (tokenQuery) {
    providedToken = tokenQuery.trim();
  }

  if (!cronSecret || !providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing CRON_SECRET token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Automated daily competitive benchmarking completed successfully.',
      newTasksCount: result.newTasksCount,
      totalTasksCount: result.tasks.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during benchmark execution';
    return NextResponse.json(
      { error: 'Failed to run competitive benchmarking', details: errorMessage },
      { status: 500 }
    );
  }
}
