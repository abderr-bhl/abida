import { NextResponse } from 'next/server';
import { runBenchmarking } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  // Simple token-based security for demonstration
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await runBenchmarking();
    return NextResponse.json({
      success: true,
      message: 'Benchmarking completed',
      ...result
    });
  } catch (error) {
    console.error('Cron benchmark error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run benchmarking' },
      { status: 500 }
    );
  }
}
