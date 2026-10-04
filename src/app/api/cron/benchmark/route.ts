import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { runBenchmark } from '@/lib/automation/benchmark';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;
  const tokenFromQuery = request.nextUrl.searchParams.get('token');

  const providedToken = tokenFromHeader || tokenFromQuery;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !providedToken || providedToken !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing cron token' },
      { status: 401 }
    );
  }

  try {
    const tasks = await runBenchmark();
    revalidatePath('/admin/tasks');

    return NextResponse.json({
      success: true,
      message: 'Daily benchmark triggered successfully',
      taskCount: tasks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error executing cron benchmark:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while running benchmark' },
      { status: 500 }
    );
  }
}
