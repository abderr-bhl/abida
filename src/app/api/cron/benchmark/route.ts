import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');
  const expectedSecret = process.env.CRON_SECRET || 'cron-secret-key-123';

  const tokenProvided = authHeader?.replace('Bearer ', '') || tokenQuery;

  if (!tokenProvided || tokenProvided !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      addedCount: result.addedCount,
      totalCount: result.totalCount,
      tasks: result.tasks
    });
  } catch (error: unknown) {
    console.error('Error running automated benchmark cron:', error);
    return NextResponse.json(
      { error: 'Internal Server Error running benchmark' },
      { status: 500 }
    );
  }
}
