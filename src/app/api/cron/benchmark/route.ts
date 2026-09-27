import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromQuery = request.nextUrl.searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;
  const expectedSecret = process.env.CRON_SECRET || 'cron-secret-key-123';

  if (!providedToken || providedToken !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      message: 'Automated daily benchmarking completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error running daily benchmark cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error while executing benchmark task' },
      { status: 500 }
    );
  }
}
