import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(_request: Request) {
  // In production, we should check for a secret token to prevent unauthorized triggers
  // const { searchParams } = new URL(request.url);
  // if (searchParams.get('token') !== process.env.CRON_SECRET) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    await runBenchmark();
    return NextResponse.json({ success: true, message: 'Benchmark completed' });
  } catch (error) {
    console.error('Benchmark API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to run benchmark' }, { status: 500 });
  }
}
