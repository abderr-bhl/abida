import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromQuery = request.nextUrl.searchParams.get('token');

  const token = tokenFromHeader || tokenFromQuery;
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || token !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron token' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: `Benchmark complete. Added ${result.added} new task(s). Total: ${result.total}`,
      data: result,
    });
  } catch (err) {
    console.error('Error running automated benchmark cron:', err);
    return NextResponse.json(
      { error: 'Internal server error running benchmark' },
      { status: 500 }
    );
  }
}
