import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  // In production, check for CRON_SECRET
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Benchmark error:', error);
    return NextResponse.json({
      success: false,
      message: 'Benchmark failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
