import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';
  const token = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('token');

  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json({ error: 'Benchmark failed' }, { status: 500 });
  }
}
