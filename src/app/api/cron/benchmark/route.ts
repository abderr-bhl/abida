import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET environment variable is not configured.' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromQuery = request.nextUrl.searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;

  if (!providedToken || providedToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing token.' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Daily benchmark completed successfully.',
      ...result,
    });
  } catch (error) {
    console.error('Error executing benchmark cron:', error);
    return NextResponse.json({ error: 'Internal server error while running benchmark.' }, { status: 500 });
  }
}
