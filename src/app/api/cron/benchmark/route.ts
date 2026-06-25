import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';
import { validateCronSecret } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const token = authHeader?.split(' ')[1] || searchParams.get('token');

  const isValid = await validateCronSecret(token);

  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Cron benchmark error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
