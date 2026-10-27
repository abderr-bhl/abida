import { NextRequest, NextResponse } from 'next/server';
import { runBenchmarkEngine } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenQuery = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET environment variable not configured.' }, { status: 500 });
  }

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const providedToken = bearerToken || tokenQuery;

  if (providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized cron execution.' }, { status: 401 });
  }

  try {
    const result = await runBenchmarkEngine();
    return NextResponse.json({
      success: true,
      message: 'Daily benchmarking completed successfully.',
      data: result,
    });
  } catch (err) {
    console.error('Error running daily cron benchmark:', err);
    return NextResponse.json({ error: 'Internal server error during benchmark execution.' }, { status: 500 });
  }
}
