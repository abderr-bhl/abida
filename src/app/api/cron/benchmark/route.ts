import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || 'cron-secret-token';
  const authHeader = request.headers.get('authorization');
  const tokenParam = request.nextUrl.searchParams.get('token');

  let providedToken: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7);
  } else if (tokenParam) {
    providedToken = tokenParam;
  }

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark triggered successfully. Generated ${result.count} new tasks.`,
      count: result.count,
      tasks: result.tasks,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to run benchmark', details: errorMessage },
      { status: 500 }
    );
  }
}
