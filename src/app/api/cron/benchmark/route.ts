import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Benchmark failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Benchmark failed'
    }, { status: 500 });
  }
}
