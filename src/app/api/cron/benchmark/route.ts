import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenParam = searchParams.get('token');
  const authHeader = request.headers.get('Authorization');

  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET environment secret is not configured on the server.' },
      { status: 500 }
    );
  }

  // Authorize via Bearer token or token query param
  let isAuthorized = false;
  if (tokenParam === cronSecret) {
    isAuthorized = true;
  } else if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      if (parts[1] === cronSecret) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized operational access.' },
      { status: 401 }
    );
  }

  try {
    const record = await runBenchmark();
    return NextResponse.json({ success: true, record });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: 'Benchmark execution failed: ' + errMsg },
      { status: 500 }
    );
  }
}
