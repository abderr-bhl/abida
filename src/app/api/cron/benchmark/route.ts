import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on server' },
      { status: 500 }
    );
  }

  // Check Bearer token or query parameter
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const urlToken = request.nextUrl.searchParams.get('token');

  const providedToken = bearerToken || urlToken;

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
      message: `Benchmark completed. ${result.addedTasks.length} new tasks created.`,
      addedTasksCount: result.addedTasks.length,
      totalTasksCount: result.totalTasks,
      addedTasks: result.addedTasks,
    });
  } catch (error) {
    console.error('Error running benchmark cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error during benchmark run' },
      { status: 500 }
    );
  }
}
