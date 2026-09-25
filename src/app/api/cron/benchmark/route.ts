import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');

  let providedToken: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7);
  } else if (tokenQuery) {
    providedToken = tokenQuery;
  }

  if (!cronSecret || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing cron secret' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during benchmarking';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
