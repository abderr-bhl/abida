import { NextRequest, NextResponse } from 'next/server';
import { runCompetitorBenchmark } from '@/lib/automation/benchmark';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'cron-secret-preview';

  // Support either Bearer token or ?token= query parameter
  const searchToken = request.nextUrl.searchParams.get('token');
  const providedToken = authHeader?.replace('Bearer ', '') || searchToken;

  if (providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
  }

  try {
    const result = await runCompetitorBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Competitor benchmark completed successfully',
      data: {
        newTasksCount: result.newTasksCount,
        totalTasksCount: result.totalTasksCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to run daily competitor benchmark:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while executing benchmark' },
      { status: 500 }
    );
  }
}
