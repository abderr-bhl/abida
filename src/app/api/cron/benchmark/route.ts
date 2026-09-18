import { NextRequest, NextResponse } from 'next/server';
import { runBenchmarking } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenParam = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET configuration missing' }, { status: 500 });
  }

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const isAuthorized = bearerToken === cronSecret || tokenParam === cronSecret;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmarking();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: `Benchmarking completed. Added ${result.addedCount} new task(s). Total: ${result.totalTasks}`,
      data: result,
    });
  } catch (error) {
    console.error('Cron benchmark failed:', error);
    return NextResponse.json(
      { error: 'Failed to run competitive benchmarking', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
