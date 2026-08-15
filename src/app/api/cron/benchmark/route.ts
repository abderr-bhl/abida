import { NextRequest, NextResponse } from 'next/server';
import { runCompetitorBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');

  const providedToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : tokenQuery;

  if (!cronSecret || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await runCompetitorBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Benchmark execution failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
