import { NextRequest, NextResponse } from 'next/server';
import { validateCronRequest } from '@/lib/auth';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(req: NextRequest) {
  if (!validateCronRequest(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing cron secret' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Competitor benchmarking finished successfully. Found ${result.newTasksCount} new tasks.`,
      result
    });
  } catch (err: unknown) {
    console.error('Error in cron benchmark:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Benchmark execution failed',
        message: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
}
