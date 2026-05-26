import { NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  // Basic security for the cron route in production
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Benchmark API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// Support POST as well if needed
export async function POST(request: Request) {
  return GET(request);
}
