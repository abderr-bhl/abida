import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET || 'cron-secret';

  // Check Authorization header (Bearer token) or query parameter 'token'
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const queryToken = request.nextUrl.searchParams.get('token');

  const token = bearerToken || queryToken;

  if (!token || token !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron authorization token' },
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
  } catch (error) {
    console.error('Cron benchmark execution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run benchmarking cron job',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
