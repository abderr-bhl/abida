import { NextRequest, NextResponse } from 'next/server';
import { runBenchmarking } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'Server misconfiguration: CRON_SECRET not set' }, { status: 500 });
  }

  const authHeader = request.headers.get('Authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');

  const providedToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : tokenQuery;

  if (providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmarking();
    return NextResponse.json({
      success: true,
      message: `Benchmarking completed successfully. Added ${result.addedCount} new tasks.`,
      addedCount: result.addedCount,
      totalTasks: result.totalTasks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron benchmark execution failed:', error);
    return NextResponse.json({ error: 'Internal server error during benchmarking' }, { status: 500 });
  }
}
