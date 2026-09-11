import { NextRequest, NextResponse } from 'next/server';
import { runCompetitiveBenchmarking } from '@/lib/automation/benchmark';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Server misconfiguration: CRON_SECRET is not configured.' },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get('authorization');
  const tokenQuery = req.nextUrl.searchParams.get('token');

  let isAuthorized = false;
  if (authHeader && authHeader === `Bearer ${cronSecret}`) {
    isAuthorized = true;
  } else if (tokenQuery === cronSecret) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCompetitiveBenchmarking();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      newTasksCount: result.newTasksCount,
      totalTasksCount: result.tasks.length,
      errors: result.errors,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
