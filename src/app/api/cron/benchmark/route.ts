import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const tokenParam = searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET || 'cron-secret-key';

  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` || tokenParam === cronSecret;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      added: result.added,
      total: result.total,
    });
  } catch (error) {
    console.error('Cron benchmark error:', error);
    return NextResponse.json(
      { error: 'Failed to run benchmark' },
      { status: 500 }
    );
  }
}
