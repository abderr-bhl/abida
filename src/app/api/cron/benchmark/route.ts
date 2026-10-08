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

  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');

  let providedToken: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7);
  } else if (tokenQuery) {
    providedToken = tokenQuery;
  }

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing secret token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    console.error('Error running automated benchmark cron:', error);
    return NextResponse.json(
      { error: 'Failed to run benchmark process.' },
      { status: 500 }
    );
  }
}
