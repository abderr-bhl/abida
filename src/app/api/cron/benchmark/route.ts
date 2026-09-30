import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET environment variable is not configured on server.' },
      { status: 500 }
    );
  }

  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // Check query param (?token=...)
  const searchParams = request.nextUrl.searchParams;
  const queryToken = searchParams.get('token');

  const providedToken = bearerToken || queryToken;

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron secret token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Daily benchmark completed successfully.',
      addedTasksCount: result.addedCount,
      totalTasksCount: result.tasks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error executing benchmark cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during benchmark execution.',
      },
      { status: 500 }
    );
  }
}
