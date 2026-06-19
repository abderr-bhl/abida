import { NextResponse } from 'next/server';
import { getTasks, saveTasks, runBenchmark } from '@/lib/automation/benchmark';
import { checkAuth } from '@/lib/auth';

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = getTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action } = await request.json();

    if (action === 'trigger_benchmark') {
      const result = await runBenchmark();
      return NextResponse.json({
        success: true,
        message: `Benchmark manual trigger completed. Discovered ${result.newTasksCount} new tasks.`,
        tasks: getTasks()
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin task action failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, updates } = await request.json();
    const tasks = getTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    saveTasks(tasks);

    return NextResponse.json(tasks[taskIndex]);
  } catch (error) {
    console.error('Admin task update failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    let tasks = getTasks();
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks(tasks);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin task deletion failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
