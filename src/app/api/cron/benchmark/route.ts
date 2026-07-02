import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  // In production, use a secure secret. For dev/demo, we allow a simpler token.
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Basic dev/preview token check
  if (process.env.NODE_ENV !== 'production' && token !== 'dev-secret') {
     // Optional: in local dev we might allow it without token for easy testing
     // but let's keep it somewhat consistent
     // return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Cron benchmark failed:', error);
    return NextResponse.json({ success: false, error: 'Benchmark failed' }, { status: 500 });
  }
}
