import { NextRequest, NextResponse } from 'next/server';
import { runBenchmarking } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('CRON_SECRET environment variable is not defined.');
    return NextResponse.json({ error: 'Cron authentication is not configured.' }, { status: 500 });
  }

  // Get token from header or query param
  const authHeader = request.headers.get('Authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = request.nextUrl.searchParams.get('token') || '';
  }

  if (!token || token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmarking();
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to complete benchmark write.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, tasksCreated: result.tasksCreatedCount });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown cron error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('CRON_SECRET environment variable is not defined.');
    return NextResponse.json({ error: 'Cron authentication is not configured.' }, { status: 500 });
  }

  // Get token
  const authHeader = request.headers.get('Authorization');
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = request.nextUrl.searchParams.get('token') || '';
  }

  if (!token || token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { action?: string } = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch {
    return NextResponse.json({ error: 'Bad Request: Strict JSON parsing failed.' }, { status: 400 });
  }

  // Strict validation for mandatory fields (e.g. action)
  if (!body.action) {
    return NextResponse.json({ error: 'Bad Request: Mandatory field "action" is missing.' }, { status: 400 });
  }

  if (body.action !== 'run_benchmark') {
    return NextResponse.json({ error: `Bad Request: Unknown action "${body.action}".` }, { status: 400 });
  }

  try {
    const result = await runBenchmarking();
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to complete benchmark write.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, tasksCreated: result.tasksCreatedCount });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown cron error' }, { status: 500 });
  }
}
