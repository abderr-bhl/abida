import { NextRequest, NextResponse } from 'next/server';
import { runBenchmarkJob } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const tokenQuery = request.nextUrl.searchParams.get('token');

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured on the server.' }, { status: 500 });
  }

  const isAuthHeaderValid = authHeader === `Bearer ${cronSecret}`;
  const isQueryTokenValid = tokenQuery === cronSecret;

  if (!isAuthHeaderValid && !isQueryTokenValid) {
    return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
  }

  try {
    const result = await runBenchmarkJob();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: 'Failed to run benchmarking job.', details: error.message }, { status: 500 });
  }
}
