import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Simple token check for cron (in production use env var)
  if (token !== process.env.CRON_SECRET && token !== 'dev-secret') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const record = await runBenchmark();
    return NextResponse.json({ success: true, record });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
