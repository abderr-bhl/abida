import { NextResponse } from 'next/server';
import { runBenchmarking } from '../../../../lib/automation/benchmark';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await runBenchmarking();
    return NextResponse.json({
      success: true,
      message: 'Benchmarking completed',
      newTasks: result.newTasksCount
    });
  } catch (error) {
    console.error('Benchmarking failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run benchmarking'
    }, { status: 500 });
  }
}
