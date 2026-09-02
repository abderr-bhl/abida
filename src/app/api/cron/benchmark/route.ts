import { NextRequest, NextResponse } from 'next/server';
import { runCompetitiveBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecretEnv = process.env.CRON_SECRET;
  if (!cronSecretEnv) {
    return NextResponse.json(
      { error: 'Server misconfiguration: CRON_SECRET is not set' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const tokenHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenQuery = request.nextUrl.searchParams.get('token');

  const providedToken = tokenHeader || tokenQuery;

  if (providedToken !== cronSecretEnv) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCompetitiveBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: unknown) {
    console.error('Cron benchmark failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
