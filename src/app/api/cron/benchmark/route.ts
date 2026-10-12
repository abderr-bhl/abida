import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET environment variable not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.replace('Bearer ', '').trim();
  const tokenFromQuery = request.nextUrl.searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;

  if (providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  try {
    // Disable fallbacks for cron execution to ensure strictly live content is captured
    const result = await runBenchmark(false);
    return NextResponse.json({
      success: true,
      addedCount: result.addedCount,
      totalTasks: result.tasks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during automated cron benchmark:', error);
    return NextResponse.json({ error: 'Failed to run benchmark process' }, { status: 500 });
  }
}
