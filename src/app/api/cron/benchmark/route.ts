import { NextRequest, NextResponse } from 'next/server';
import { runCompetitorBenchmark } from '@/lib/automation/benchmark';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const tokenQuery = request.nextUrl.searchParams.get('token');

  const providedToken = authHeader?.replace(/^Bearer\s+/i, '') || tokenQuery;

  if (cronSecret && providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCompetitorBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      benchmark: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
