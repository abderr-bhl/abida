import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = request.nextUrl.searchParams.get('token');

  // Simple token check for cron job security
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    token === (process.env.CRON_SECRET || 'dev-secret');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newTasks = await runBenchmark();
    return NextResponse.json({
      message: 'Benchmark completed successfully',
      newTasksCount: newTasks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Benchmark cron failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
