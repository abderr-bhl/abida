import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  const queryToken = searchParams.get('token');

  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  // Check Bearer token or 'token' query param
  let authorized = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === cronSecret) {
      authorized = true;
    }
  }

  if (queryToken && queryToken === cronSecret) {
    authorized = true;
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running benchmark via cron:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error during benchmark' },
      { status: 500 }
    );
  }
}
