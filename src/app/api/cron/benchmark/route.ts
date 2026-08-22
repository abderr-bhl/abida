import { NextRequest, NextResponse } from 'next/server';
import { runCompetitorBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.replace(/^Bearer\s+/i, '');
  const searchParams = request.nextUrl.searchParams;
  const tokenFromQuery = searchParams.get('token');

  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || (tokenFromHeader !== cronSecret && tokenFromQuery !== cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCompetitorBenchmark();
    return NextResponse.json({
      success: true,
      added: result.added,
      total: result.total,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to run benchmark cron job', details: message }, { status: 500 });
  }
}
