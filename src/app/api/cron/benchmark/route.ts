import { NextResponse } from 'next/server';
import { runBenchmarking } from '../../../../lib/automation/benchmark';

export async function GET(request: Request) {
  // In production, check for CRON_SECRET or similar authorization
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const result = await runBenchmarking();
    return NextResponse.json({
      success: true,
      message: 'Benchmarking completed',
      ...result
    });
  } catch (error) {
    console.error('Benchmarking cron failed:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
