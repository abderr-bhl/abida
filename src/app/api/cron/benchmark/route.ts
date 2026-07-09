import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  // Verify cron secret (in production this would be set in env)
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';

  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Also allow trigger via query param for easier dev testing
  const token = request.nextUrl.searchParams.get('token');
  if (process.env.NODE_ENV !== 'production' && token !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
     // Optional: still allow if no token in dev, but keep it for better practice
     // return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      message: 'Benchmark completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error running automated benchmark:', error);
    return NextResponse.json({ error: 'Failed to run benchmark' }, { status: 500 });
  }
}
