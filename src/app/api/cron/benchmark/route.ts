import { NextResponse } from 'next/server';
import { runBenchmarking } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (process.env.NODE_ENV === 'production' && token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmarking();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Cron benchmark failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
