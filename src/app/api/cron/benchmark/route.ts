import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const { searchParams } = new URL(request.url);
    token = searchParams.get('token') || '';
  }

  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const record = await runBenchmark();
    return NextResponse.json(record);
  } catch (err) {
    console.error('Error during cron benchmark run:', err);
    return NextResponse.json(
      { status: 'failed', error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
