import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';

  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark completed. Discovered ${result.newTasksCount} new tasks.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Benchmark failed:', error);
    return NextResponse.json({ error: 'Benchmark failed' }, { status: 500 });
  }
}
