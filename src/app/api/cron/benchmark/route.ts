import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  // In production, you would check against a secret token
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const result = await runBenchmark();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Benchmark cron error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
