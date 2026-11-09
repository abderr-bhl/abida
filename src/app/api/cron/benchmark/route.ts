import { NextRequest, NextResponse } from 'next/server';
import { runCompetitorBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const tokenQuery = searchParams.get('token');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET is not configured on the server' },
        { status: 500 }
      );
    }

    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (bearerToken !== expectedSecret && tokenQuery !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid cron secret' },
        { status: 401 }
      );
    }

    const benchmarkResult = await runCompetitorBenchmark();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        createdTasks: benchmarkResult.createdTasksCount,
        totalTasks: benchmarkResult.totalTasksCount,
      },
      newTasks: benchmarkResult.newTasks,
    });
  } catch (error) {
    console.error('Error executing automated competitor benchmark:', error);
    return NextResponse.json(
      {
        error: 'Failed to run competitor benchmark',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
