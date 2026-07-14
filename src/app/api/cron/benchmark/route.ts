import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Simple token check for cron security
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && token !== process.env.CRON_SECRET) {
    // In production, you would use a real secret. For this task, we'll allow if no secret is set for testing purposes,
    // but ideally we check it.
    if (process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Benchmark error:', error);
    return NextResponse.json({ error: 'Failed to run benchmark' }, { status: 500 });
  }
}
