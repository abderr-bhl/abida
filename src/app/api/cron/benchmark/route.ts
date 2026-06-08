import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const newTasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark completed. ${newTasks.length} new tasks generated.`,
      tasks: newTasks
    });
  } catch (error) {
    console.error('Benchmark error:', error);
    return NextResponse.json({ success: false, error: 'Benchmark failed' }, { status: 500 });
  }
}
