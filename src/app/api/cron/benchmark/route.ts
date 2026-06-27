import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';

  // Also check for a token in the query params for easier testing
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (authHeader !== `Bearer ${cronSecret}` && token !== cronSecret) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed',
      ...result
    });
  } catch (error) {
    console.error('Cron benchmark failed:', error);
    return NextResponse.json({ success: false, error: 'Benchmark failed' }, { status: 500 });
  }
}
