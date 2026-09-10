import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET configuration is missing on server.' },
      { status: 500 }
    );
  }

  // Check Bearer token in Authorization header or token in searchParams
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');

  const providedToken = bearerToken || queryToken;

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron benchmark execution failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to run competitive benchmark.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
