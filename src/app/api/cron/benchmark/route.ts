import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken } from '@/lib/auth';
import { runBenchmark } from '@/lib/automation/benchmark';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!validateApiToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing cron secret' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      newTasksCount: result.newTasksCount,
      totalTasksCount: result.totalTasksCount
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown benchmarking failure';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
