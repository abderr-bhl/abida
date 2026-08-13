import { NextRequest, NextResponse } from 'next/server';
import { runBenchmarking } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  // Check auth: Bearer token in Authorization header, or token query param
  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');

  let incomingToken = '';
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    incomingToken = authHeader.substring(7);
  } else if (tokenQuery) {
    incomingToken = tokenQuery;
  }

  if (!incomingToken || incomingToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing cron secret token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmarking();
    return NextResponse.json({
      success: true,
      message: `Daily benchmark ran successfully. Added ${result.count} tasks.`,
      addedCount: result.count
    });
  } catch (err) {
    console.error('Daily cron benchmark failed:', err);
    return NextResponse.json(
      { error: 'Benchmark execution failed', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
