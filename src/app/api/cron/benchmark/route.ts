import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'Server configuration error: CRON_SECRET is not defined.' }, { status: 500 });
  }

  // Verify Bearer token or token query parameter
  const authHeader = request.headers.get('authorization');
  let token = '';
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = request.nextUrl.searchParams.get('token') || '';
  }

  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'Server configuration error: CRON_SECRET is not defined.' }, { status: 500 });
  }

  // Verify Bearer token or token query parameter
  const authHeader = request.headers.get('authorization');
  let token = '';
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = request.nextUrl.searchParams.get('token') || '';
  }

  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Strict JSON parsing error handling
  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad Request: Invalid or malformed JSON payload.' }, { status: 400 });
  }

  // Validation for mandatory fields (e.g., 'action')
  if (!body || typeof body !== 'object' || !body.action) {
    return NextResponse.json({ error: 'Bad Request: Missing mandatory field "action".' }, { status: 400 });
  }

  if (body.action !== 'benchmark') {
    return NextResponse.json({ error: 'Bad Request: Invalid value for "action". Expected "benchmark".' }, { status: 400 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
