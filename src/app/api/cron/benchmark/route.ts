import { NextRequest, NextResponse } from 'next/server';
import { runCompetitiveBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenParam = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured on the server' }, { status: 500 });
  }

  const isHeaderValid = authHeader === `Bearer ${cronSecret}`;
  const isQueryValid = tokenParam === cronSecret;

  if (!isHeaderValid && !isQueryValid) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing cron token' }, { status: 401 });
  }

  try {
    const result = await runCompetitiveBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmarking complete. Created ${result.count} new task(s).`,
      newTasksCount: result.count,
    });
  } catch (err) {
    console.error('Error during automated benchmarking cron run:', err);
    return NextResponse.json({ error: 'Failed to run competitive benchmark' }, { status: 500 });
  }
}
