import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const tokenQuery = searchParams.get('token');

  const cronSecret = process.env.CRON_SECRET || 'cron-secret-key';

  const isHeaderValid = authHeader === `Bearer ${cronSecret}`;
  const isQueryValid = tokenQuery === cronSecret;

  if (!isHeaderValid && !isQueryValid) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing secret token' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error during benchmark';
    return NextResponse.json(
      { error: 'Failed to execute benchmark', details: message },
      { status: 500 }
    );
  }
}
