import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  // In production, check for CRON_SECRET to ensure only Vercel can call this
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run benchmark'
    }, { status: 500 });
  }
}
