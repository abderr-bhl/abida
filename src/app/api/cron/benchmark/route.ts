import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const tokenQueryParam = request.nextUrl.searchParams.get('token');

  const tokenMatches =
    (authHeader && authHeader === `Bearer ${cronSecret}`) ||
    (tokenQueryParam && tokenQueryParam === cronSecret);

  if (!cronSecret || !tokenMatches) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Benchmark execution failed', details: message },
      { status: 500 }
    );
  }
}
