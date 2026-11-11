import { NextRequest, NextResponse } from 'next/server';
import { runCompetitorBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  // Protect cron endpoint with CRON_SECRET if configured
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const isBearerValid = authHeader === `Bearer ${cronSecret}`;
    const urlToken = request.nextUrl.searchParams.get('token');
    const isTokenValid = urlToken === cronSecret;

    if (!isBearerValid && !isTokenValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await runCompetitorBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      benchmark: result
    });
  } catch (error) {
    console.error('Cron benchmark execution failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during benchmark execution' },
      { status: 500 }
    );
  }
}
