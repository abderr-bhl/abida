import { NextRequest, NextResponse } from 'next/server';
import { runBenchmarking } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const urlToken = request.nextUrl.searchParams.get('token');
  const expectedToken = process.env.CRON_SECRET || 'cron-secret-token';

  const tokenMatches =
    urlToken === expectedToken || authHeader === `Bearer ${expectedToken}`;

  if (!tokenMatches) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmarking();
    return NextResponse.json({
      success: true,
      message: `Benchmarking completed. Added ${result.addedCount} new tasks.`,
      data: result,
    });
  } catch (error) {
    console.error('Error during automated benchmarking cron:', error);
    return NextResponse.json({ error: 'Failed to run benchmarking' }, { status: 500 });
  }
}
