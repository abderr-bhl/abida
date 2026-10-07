import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromQuery = request.nextUrl.searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || providedToken !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing secret token' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      tasksCreated: result.tasksCreated,
      totalTasks: result.tasks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error running benchmark cron job:', error);
    return NextResponse.json(
      { error: 'Failed to execute benchmark run' },
      { status: 500 }
    );
  }
}
