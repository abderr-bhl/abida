import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || 'cron-secret-key';

  const authHeader = request.headers.get('authorization');
  const tokenParam = request.nextUrl.searchParams.get('token');

  const providedToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : tokenParam;

  if (providedToken !== cronSecret) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized cron access' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      addedCount: result.addedCount,
      totalTasks: result.totalTasks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error running automated benchmark:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during benchmark' },
      { status: 500 }
    );
  }
}
