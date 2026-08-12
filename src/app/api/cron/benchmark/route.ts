import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'Security configuration error: CRON_SECRET is not configured on the server.' },
        { status: 500 }
      );
    }

    let token = '';
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.substring(7);
    } else {
      const searchParams = request.nextUrl.searchParams;
      token = searchParams.get('token') || '';
    }

    if (!token || token !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing token.' },
        { status: 401 }
      );
    }

    const result = await runBenchmark();
    return NextResponse.json(result);
  } catch (err) {
    console.error('Error running cron benchmark:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
