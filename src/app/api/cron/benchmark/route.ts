import { NextRequest, NextResponse } from 'next/server';
import { runBenchmarking } from '@/lib/automation/benchmark';

/**
 * API route to run competitive benchmarking.
 * Triggered by daily Vercel cron jobs.
 * Enforces authorization token verification against the CRON_SECRET environment variable.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: 'CRON_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  // 1. Check Bearer token in the Authorization header
  const authHeader = request.headers.get('Authorization');
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Fall back to 'token' query parameter
  if (!token) {
    const searchParams = request.nextUrl.searchParams;
    token = searchParams.get('token') || '';
  }

  if (token !== cronSecret) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid cron token.' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmarking();
    return NextResponse.json({
      success: true,
      message: `Daily competitive benchmark run completed successfully!`,
      added: result.added,
      total: result.total,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
