import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Automated benchmark completed successfully.',
      tasksGenerated: tasks.length,
    });
  } catch (error) {
    console.error('Cron benchmark execution failed:', error);
    return NextResponse.json({ error: 'Benchmark execution failed' }, { status: 500 });
  }
}
