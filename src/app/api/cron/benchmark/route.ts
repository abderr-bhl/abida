import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET environment variable is not configured.' },
      { status: 500 }
    );
  }

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const providedToken = bearerToken || tokenQuery;

  if (providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark completed successfully. ${result.addedCount} new tasks generated.`,
      addedCount: result.addedCount,
      totalTasks: result.tasks.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to run automated benchmark.', details: message },
      { status: 500 }
    );
  }
}
