import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';

  if (process.env.NODE_ENV === 'production' && token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newTasks = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark completed. ${newTasks.length} new tasks created.`
    });
  } catch (error) {
    console.error('Benchmark failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
