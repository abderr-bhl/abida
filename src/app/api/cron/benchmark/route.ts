import { NextRequest, NextResponse } from 'next/server';
import { runCompetitiveBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const queryToken = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }

  const isValidHeader = authHeader === `Bearer ${cronSecret}`;
  const isValidQuery = queryToken === cronSecret;

  if (!isValidHeader && !isValidQuery) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCompetitiveBenchmark();
    return NextResponse.json({
      success: true,
      addedTasks: result.addedCount,
      totalTasks: result.tasks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error running daily cron benchmark:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
