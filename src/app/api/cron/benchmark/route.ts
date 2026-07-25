import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: 'CRON_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  // Check Bearer token in Authorization header
  const authHeader = request.headers.get('Authorization');
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Check 'token' query parameter
  if (!token) {
    const { searchParams } = new URL(request.url);
    token = searchParams.get('token') || '';
  }

  if (token !== cronSecret) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const record = await runBenchmark();
    return NextResponse.json({ success: true, record });
  } catch (err) {
    console.error('API cron benchmark error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
