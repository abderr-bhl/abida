import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Simple token check for demo
  const CRON_SECRET = process.env.CRON_SECRET || 'demo-token';
  if (token !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed',
      result
    });
  } catch (error) {
    console.error('Benchmark error:', error);
    return NextResponse.json({ error: 'Failed to run benchmark' }, { status: 500 });
  }
}
