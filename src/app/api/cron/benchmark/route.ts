import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Server configuration error: CRON_SECRET is not configured.' },
      { status: 500 }
    );
  }

  // Check Authorization header (Bearer token) or URL query parameter 'token'
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : null;

  const { searchParams } = new URL(request.url);
  const tokenFromQuery = searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid or missing cron secret token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Automated daily benchmarking executed successfully.',
      addedTasksCount: result.addedTasksCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Cron benchmark execution error:', err);
    return NextResponse.json(
      { error: 'Failed to execute daily benchmarking process.' },
      { status: 500 }
    );
  }
}
