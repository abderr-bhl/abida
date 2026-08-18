import { NextRequest, NextResponse } from 'next/server';
import { runCompetitiveBenchmarking } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const tokenFromQuery = request.nextUrl.searchParams.get('token');

    const providedToken = tokenFromHeader || tokenFromQuery;
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || providedToken !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runCompetitiveBenchmarking();

    return NextResponse.json({
      success: true,
      message: `Benchmarking completed successfully. Added ${result.addedCount} new tasks.`,
      addedCount: result.addedCount,
      totalTasks: result.tasks.length,
    });
  } catch (error) {
    console.error('Error running cron benchmark:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
