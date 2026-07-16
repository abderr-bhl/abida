import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Simple token check for cron security
  const CRON_SECRET = process.env.CRON_SECRET;

  if (!CRON_SECRET || (authHeader !== `Bearer ${CRON_SECRET}` && token !== CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newTasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark completed. ${newTasks.length} new tasks created.`,
      newTasksCount: newTasks.length
    });
  } catch (error) {
    console.error('Cron benchmark error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
