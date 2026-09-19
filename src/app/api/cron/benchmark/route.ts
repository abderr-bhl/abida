import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET configuration missing' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const providedToken = bearerToken || tokenQuery;

  if (providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      addedTasksCount: result.addedTasksCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron benchmark execution failed:', error);
    return NextResponse.json({ error: 'Internal server error during benchmark' }, { status: 500 });
  }
}
