import { NextRequest, NextResponse } from 'next/server';
import { runCompetitiveBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const tokenParam = searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  const providedToken = bearerToken || tokenParam;

  if (providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCompetitiveBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: unknown) {
    console.error('Error during automated competitive benchmark:', error);
    return NextResponse.json(
      { success: false, error: 'Benchmark execution failed' },
      { status: 500 }
    );
  }
}
