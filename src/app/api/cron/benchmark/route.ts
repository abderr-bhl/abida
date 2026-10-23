import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET || 'default-cron-secret-123';

  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (bearerToken !== cronSecret && tokenQuery !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized cron access' }, { status: 401 });
  }

  try {
    const updatedTasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark job executed successfully',
      taskCount: updatedTasks.length,
      tasks: updatedTasks
    });
  } catch (error) {
    console.error('Cron benchmark execution failed:', error);
    return NextResponse.json({ error: 'Failed to run competitive benchmark' }, { status: 500 });
  }
}
