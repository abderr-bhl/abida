import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  // In a real production environment, you would verify a secret token
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Benchmark error:', error);
    return NextResponse.json({ success: false, error: 'Failed to run benchmark' }, { status: 500 });
  }
}
