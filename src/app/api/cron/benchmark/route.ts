import { NextRequest, NextResponse } from 'next/server';
import { runCompetitiveBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const searchParams = request.nextUrl.searchParams;
  const tokenFromQuery = searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCompetitiveBenchmark();
    return NextResponse.json({
      success: true,
      addedTasks: result.addedCount,
      tasks: result.newTasks
    });
  } catch (error) {
    console.error('Error running benchmark cron job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
