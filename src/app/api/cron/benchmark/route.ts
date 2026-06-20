import { NextResponse, NextRequest } from 'next/server';
import { runBenchmark } from '@/lib/automation/benchmark';
import { checkCronAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!checkCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      message: 'Benchmark completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Benchmark failed:', error);
    return NextResponse.json({ error: 'Benchmark failed' }, { status: 500 });
  }
}
