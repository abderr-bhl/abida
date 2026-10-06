import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken) {
    return NextResponse.json({ error: 'CRON_SECRET environment variable is not configured' }, { status: 500 });
  }

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const providedToken = bearerToken || tokenQuery;

  if (!providedToken || providedToken !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to run benchmark', details: errorMessage }, { status: 500 });
  }
}
