import { NextResponse } from 'next/server';
import { runAutomationCycle } from '@/lib/automation/benchmark';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // In production, this should match a CRON_SECRET environment variable
  if (process.env.NODE_ENV === 'production' && token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runAutomationCycle();
    return NextResponse.json({
      success: true,
      message: 'Automation cycle completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Automation cycle failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Automation cycle failed'
    }, { status: 500 });
  }
}
