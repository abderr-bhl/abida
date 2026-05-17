import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  // Authentication check for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { results, tasks } = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmarking complete. ${tasks.length} tasks generated.`,
      results
    });
  } catch (error) {
    console.error('Benchmark cron failed:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
