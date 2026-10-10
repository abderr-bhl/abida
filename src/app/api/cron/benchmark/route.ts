import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const queryToken = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` || queryToken === cronSecret;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark executed successfully',
      added: result.added,
      totalTasks: result.tasks.length,
    });
  } catch (error) {
    console.error('Error executing benchmark cron:', error);
    return NextResponse.json(
      { error: 'Failed to run benchmark execution' },
      { status: 500 }
    );
  }
}
