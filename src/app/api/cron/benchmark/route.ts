import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';

  // Basic security check for the cron job
  const token = request.nextUrl.searchParams.get('token');

  if (authHeader !== `Bearer ${cronSecret}` && token !== cronSecret && process.env.NODE_ENV === 'production') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      message: 'Benchmark completed successfully',
      result
    });
  } catch (error) {
    console.error('Benchmark cron failed:', error);
    return NextResponse.json({
      error: 'Failed to run benchmark',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
