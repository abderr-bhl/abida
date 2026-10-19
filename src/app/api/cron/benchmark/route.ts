import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');

  const isValidToken =
    cronSecret &&
    ((authHeader && authHeader === `Bearer ${cronSecret}`) ||
      (tokenQuery && tokenQuery === cronSecret));

  if (!isValidToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      generatedTasksCount: tasks.length,
    });
  } catch (error) {
    console.error('Error executing benchmark cron:', error);
    return NextResponse.json(
      { error: 'Failed to run benchmark' },
      { status: 500 }
    );
  }
}
