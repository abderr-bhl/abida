import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const tokenParam = searchParams.get('token');

  const expectedSecret = process.env.CRON_SECRET;

  const isHeaderValid = authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === expectedSecret;
  const isParamValid = tokenParam && tokenParam === expectedSecret;

  if (!expectedSecret || (!isHeaderValid && !isParamValid)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      addedCount: result.addedCount,
      totalTasks: result.tasks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error running benchmark cron job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
