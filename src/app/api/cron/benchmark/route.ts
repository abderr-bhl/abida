import { NextRequest, NextResponse } from 'next/server';
import { runBenchmarkEngine } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'Cron automation is not configured on server.' },
        { status: 500 }
      );
    }

    let token: string | null = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const { searchParams } = new URL(request.url);
      token = searchParams.get('token');
    }

    if (!token || token !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized access.' },
        { status: 401 }
      );
    }

    const result = await runBenchmarkEngine();

    return NextResponse.json({
      success: true,
      message: 'Benchmark executed successfully.',
      record: result,
    });
  } catch (err) {
    console.error('Error in cron benchmark API:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'Cron automation is not configured on server.' },
        { status: 500 }
      );
    }

    let token: string | null = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const { searchParams } = new URL(request.url);
      token = searchParams.get('token');
    }

    if (!token || token !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized access.' },
        { status: 401 }
      );
    }

    let body: { action?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || !body.action) {
      return NextResponse.json(
        { error: 'Missing mandatory field: action.' },
        { status: 400 }
      );
    }

    if (body.action !== 'benchmark') {
      return NextResponse.json(
        { error: 'Invalid action value. Supported actions: benchmark.' },
        { status: 400 }
      );
    }

    const result = await runBenchmarkEngine();
    return NextResponse.json({
      success: true,
      message: 'Benchmark triggered via POST action successfully.',
      record: result,
    });
  } catch (err) {
    console.error('Error in cron benchmark POST API:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
