import { NextRequest, NextResponse } from 'next/server';
import { validateCronAuth } from '@/lib/auth';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing cron secret' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during benchmark execution';
    return NextResponse.json(
      { error: 'Failed to run benchmark cron', details: errorMessage },
      { status: 500 }
    );
  }
}
