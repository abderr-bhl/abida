import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  const queryToken = request.nextUrl.searchParams.get('token');

  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  let providedToken: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7);
  } else if (queryToken) {
    providedToken = queryToken;
  }

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Daily benchmark completed successfully',
      newTasksCount: result.newTasksCount,
      totalTasks: result.tasks.length,
    });
  } catch (error) {
    console.error('Error executing benchmark cron:', error);
    return NextResponse.json(
      { error: 'Failed to execute benchmark run.' },
      { status: 500 }
    );
  }
}
