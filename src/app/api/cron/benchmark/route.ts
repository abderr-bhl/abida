import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenParam = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const providedToken = bearerToken || tokenParam;

  if (!cronSecret || !providedToken || providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Daily benchmark completed',
      count: tasks.length
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Benchmark execution failed', details: String(error) },
      { status: 500 }
    );
  }
}
