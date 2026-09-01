import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');

  const providedToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : tokenQuery;

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      addedTasks: result.added,
      totalTasks: result.total,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Cron benchmark execution failed:', error);
    return NextResponse.json(
      { error: 'Benchmark execution failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
