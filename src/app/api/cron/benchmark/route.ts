import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  const queryToken = request.nextUrl.searchParams.get('token');

  const providedToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : queryToken;

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      message: 'Benchmark completed successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error executing benchmark cron job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
