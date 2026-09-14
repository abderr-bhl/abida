import { runBenchmark } from '@/lib/automation/benchmark';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const urlToken = request.nextUrl.searchParams.get('token');

  const cronSecret = process.env.CRON_SECRET || 'cron-secret';

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (urlToken) {
    token = urlToken;
  }

  if (token !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing secret token' },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        added: result.added,
        existing: result.existing,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error('Error running automated benchmark cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
