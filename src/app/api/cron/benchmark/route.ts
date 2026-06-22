import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
    // Fallback for dev if no secret is set, but in production this should be strict
    if (process.env.NODE_ENV === 'production' || token !== 'dev-secret') {
       return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    const newTasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `${newTasks.length} new tasks created`,
      tasks: newTasks
    });
  } catch (error) {
    console.error('Benchmark cron failed:', error);
    return NextResponse.json({ success: false, error: 'Benchmark failed' }, { status: 500 });
  }
}
