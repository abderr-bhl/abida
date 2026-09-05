import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on the server.' },
      { status: 401 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  const { searchParams } = new URL(request.url);
  const tokenFromQuery = searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;

  if (!providedToken || providedToken !== secret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing secret token.' },
      { status: 401 }
    );
  }

  try {
    const tasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tasksCount: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Cron benchmark execution failed:', error);
    return NextResponse.json(
      { error: 'Failed to execute benchmark run.' },
      { status: 500 }
    );
  }
}
