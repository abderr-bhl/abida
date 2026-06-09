import { NextResponse } from 'next/server';
import { runBenchmark } from '../../../../lib/automation/benchmark';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // In a real app, this would check against process.env.CRON_SECRET
  if (process.env.NODE_ENV === 'production' && token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Benchmark error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
