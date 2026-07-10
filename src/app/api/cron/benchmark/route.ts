import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  const CRON_SECRET = process.env.CRON_SECRET;

  if (!CRON_SECRET || (authHeader !== `Bearer ${CRON_SECRET}` && token !== CRON_SECRET)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Cron benchmark failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Benchmark failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
