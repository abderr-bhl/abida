import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    const tokenParam = req.nextUrl.searchParams.get('token');

    const providedToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : tokenParam;

    if (!providedToken || providedToken !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const newTasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      newTasksCount: newTasks.length,
      newTasks,
    });
  } catch (error) {
    console.error('Error running daily benchmark:', error);
    return NextResponse.json({ error: 'Failed to run benchmark' }, { status: 500 });
  }
}
