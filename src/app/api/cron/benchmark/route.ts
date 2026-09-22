import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET environment variable is not configured on the server' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  const searchParams = request.nextUrl.searchParams;
  const tokenFromQuery = searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing secret token' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: `Daily benchmark completed successfully. Found ${result.newTasksCount} new competitor tasks.`,
      newTasksCount: result.newTasksCount,
      totalTasksCount: result.totalTasksCount,
    });
  } catch (error) {
    console.error('Error executing automated daily benchmark:', error);
    return NextResponse.json(
      { error: 'Failed to run daily benchmarking process' },
      { status: 500 }
    );
  }
}
