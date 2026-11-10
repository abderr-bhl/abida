import { NextRequest, NextResponse } from 'next/server';
import { runCompetitorBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const searchParams = request.nextUrl.searchParams;
  const tokenParam = searchParams.get('token');

  const providedSecret = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : tokenParam;

  if (!cronSecret || providedSecret !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing cron secret' },
      { status: 401 }
    );
  }

  try {
    const result = await runCompetitorBenchmark();
    return NextResponse.json({
      success: true,
      message: `Daily benchmark completed successfully. Scanned ${result.scannedCount} items, generated ${result.newTasksCount} new tasks.`,
      scannedCount: result.scannedCount,
      newTasksCount: result.newTasksCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error during automated daily benchmark:', error);
    return NextResponse.json(
      { error: 'Failed to run daily benchmark' },
      { status: 500 }
    );
  }
}
