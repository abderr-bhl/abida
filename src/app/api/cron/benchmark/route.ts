import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request) {
  // In a real application, you would check for a secret token
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const newTasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed',
      newTasksCount: newTasks.length,
    });
  } catch (error) {
    console.error('Benchmark failed:', error);
    return NextResponse.json(
      { success: false, message: 'Benchmark failed' },
      { status: 500 }
    );
  }
}
