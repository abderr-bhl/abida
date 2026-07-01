import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken } from '@/lib/auth';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(req: NextRequest) {
  if (!validateApiToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: 'Benchmark completed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Benchmark failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
