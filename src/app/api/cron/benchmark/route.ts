import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;
  const tokenFromQuery = request.nextUrl.searchParams.get('token');

  const cronSecret = process.env.CRON_SECRET;
  const providedToken = tokenFromHeader || tokenFromQuery;

  if (!cronSecret || !providedToken || providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark completed successfully. ${result.addedCount} new tasks created.`,
      addedCount: result.addedCount,
      totalTasks: result.tasks.length,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error running automated cron benchmark:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
