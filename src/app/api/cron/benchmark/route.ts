import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  // In production, check for CRON_SECRET
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  } else {
    // Basic dev check
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (token !== 'dev-secret' && authHeader !== 'Bearer dev-secret') {
       // Allow for now to facilitate testing if needed, but standardizing
    }
  }

  try {
    const record = await runBenchmark();
    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Benchmark cron failed:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
