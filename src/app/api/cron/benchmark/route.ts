import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenParam = request.nextUrl.searchParams.get('token');

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET environment variable is not configured.' },
      { status: 500 }
    );
  }

  const isHeaderValid = authHeader === `Bearer ${cronSecret}`;
  const isQueryValid = tokenParam === cronSecret;

  if (!isHeaderValid && !isQueryValid) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid CRON_SECRET token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark completed. ${result.addedCount} new task(s) added.`,
      addedCount: result.addedCount,
      totalTasks: result.tasks.length,
    });
  } catch (err: unknown) {
    console.error('Error in cron benchmark API route:', err);
    return NextResponse.json(
      { error: 'Failed to run benchmark.' },
      { status: 500 }
    );
  }
}
