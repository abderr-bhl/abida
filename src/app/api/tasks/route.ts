import { NextResponse } from 'next/server';
import { loadTasks } from '@/lib/automation/benchmark';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await loadTasks();
  return NextResponse.json(tasks);
}
