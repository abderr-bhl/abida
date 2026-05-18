import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  // Check for authorization in production
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const tasks = await runBenchmark();
    return NextResponse.json({ success: true, tasksGenerated: tasks.length });
  } catch (error) {
    console.error('Benchmark failed:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
