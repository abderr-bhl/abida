import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';

  if (authHeader !== `Bearer ${CRON_SECRET}` && token !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Cron benchmark error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
