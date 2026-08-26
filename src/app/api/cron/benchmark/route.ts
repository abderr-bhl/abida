import { NextRequest, NextResponse } from 'next/server';
import { runCompetitiveBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const queryToken = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  const providedToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : queryToken;

  if (!cronSecret || providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCompetitiveBenchmark();
    return NextResponse.json({
      success: true,
      addedTasks: result.added,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
