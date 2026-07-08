import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  // Simple protection with a secret token
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && token !== process.env.CRON_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    const newTasksCount = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark completed. ${newTasksCount} new tasks generated.`,
      count: newTasksCount
    });
  } catch (error) {
    console.error('Benchmark API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
