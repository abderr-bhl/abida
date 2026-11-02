import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const queryToken = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  const providedToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : queryToken;

  if (!cronSecret || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing CRON_SECRET token' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Automated daily competitor benchmark completed successfully.',
      timestamp: new Date().toISOString(),
      newTasksCount: result.newTasksCount,
      totalTasksCount: result.totalTasksCount
    });
  } catch (error) {
    console.error('Error running automated benchmark cron:', error);
    return NextResponse.json(
      { error: 'Failed to run competitive benchmark job' },
      { status: 500 }
    );
  }
}
