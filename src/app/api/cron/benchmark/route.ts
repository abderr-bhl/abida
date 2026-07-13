import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && token !== cronSecret) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Benchmark failed:', error);
    return NextResponse.json({ status: 'failure', error: 'Internal Server Error' }, { status: 500 });
  }
}
