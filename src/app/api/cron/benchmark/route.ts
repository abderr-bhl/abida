import { NextRequest, NextResponse } from 'next/server';
import { runCompetitiveBenchmark } from '@/lib/automation/benchmark';

// Dynamic endpoint
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check Authorization Bearer token or token query param matching CRON_SECRET env
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return new NextResponse(
      JSON.stringify({ error: 'Cron token authentication is not configured on the server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 1. Check Query parameter 'token'
  const { searchParams } = new URL(request.url);
  const queryToken = searchParams.get('token');

  // 2. Check Authorization Header Bearer token
  const authHeader = request.headers.get('Authorization');
  let headerToken = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    headerToken = authHeader.substring(7);
  }

  const authenticated = queryToken === cronSecret || headerToken === cronSecret;

  if (!authenticated) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized: Invalid or missing secret token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const record = await runCompetitiveBenchmark();
    return new NextResponse(
      JSON.stringify({
        message: 'Daily competitor RSS benchmarking job executed successfully.',
        record
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const error = err as Error;
    return new NextResponse(
      JSON.stringify({ error: 'Benchmarking failed', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
