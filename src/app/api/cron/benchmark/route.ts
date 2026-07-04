import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (authHeader !== `Bearer ${cronSecret}` && token !== cronSecret) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const record = await runBenchmark();
    return NextResponse.json({
      message: 'Benchmark completed successfully',
      record
    });
  } catch (error) {
    console.error('Cron benchmark failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
