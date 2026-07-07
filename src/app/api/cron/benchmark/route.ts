import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';

  // Verification for Vercel Cron or manual dev call
  if (authHeader !== `Bearer ${cronSecret}`) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (token !== cronSecret) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
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
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
