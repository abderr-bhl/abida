import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromQuery = request.nextUrl.searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || providedToken !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      added: result.added,
      total: result.total,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error running daily benchmark cron:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
