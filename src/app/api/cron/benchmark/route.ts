import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  // In production, we should check for a secret token to prevent unauthorized triggers
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      result
    });
  } catch (error) {
    console.error('Benchmark failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Benchmark failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
