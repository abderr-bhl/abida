import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromQuery = request.nextUrl.searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;
  const cronSecret = process.env.CRON_SECRET || 'cron-secret-key';

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid or missing cron secret token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Automated benchmarking completed successfully. Added ${result.added} new task(s).`,
      addedCount: result.added,
      totalCount: result.total,
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Error during automated cron benchmark execution:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error running benchmark automation.' },
      { status: 500 }
    );
  }
}
