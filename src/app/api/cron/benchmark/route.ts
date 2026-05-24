import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  // In a real app, you'd check for an auth header or cron secret
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const newTasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      count: newTasks.length,
      tasks: newTasks
    });
  } catch (error) {
    console.error('Benchmark failed:', error);
    return NextResponse.json({ success: false, error: 'Benchmark failed' }, { status: 500 });
  }
}
