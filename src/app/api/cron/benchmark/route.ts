import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on the server' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;
  const searchParams = request.nextUrl.searchParams;
  const queryToken = searchParams.get('token');

  const token = bearerToken || queryToken;

  if (!token || token !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron secret token' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      message: 'Benchmarking executed successfully',
      ...result,
    });
  } catch (err) {
    console.error('Cron benchmark execution failed:', err);
    return NextResponse.json(
      { error: 'Failed to execute benchmarking tasks' },
      { status: 500 }
    );
  }
}
