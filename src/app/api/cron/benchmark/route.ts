import { NextRequest, NextResponse } from 'next/server';
import { runCompetitorBenchmark } from '@/lib/automation/benchmark';

/**
 * Daily automated cron endpoint for competitor benchmarking.
 * Triggered automatically by Vercel Cron or GitHub Actions.
 * Secured with CRON_SECRET authorization.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const tokenParam = searchParams.get('token');

  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Server misconfiguration: CRON_SECRET is not configured' },
      { status: 500 }
    );
  }

  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (bearerToken !== expectedSecret && tokenParam !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const benchmarkResult = await runCompetitorBenchmark();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      benchmark: benchmarkResult,
    });
  } catch (error) {
    console.error('Cron benchmark failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown benchmarking failure',
      },
      { status: 500 }
    );
  }
}
