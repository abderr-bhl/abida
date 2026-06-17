import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function GET() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(data);
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(data);

    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, status } : task
    );

    await fs.writeFile(TASKS_FILE, JSON.stringify(updatedTasks, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(data);

    const filteredTasks = tasks.filter(task => task.id !== id);

    await fs.writeFile(TASKS_FILE, JSON.stringify(filteredTasks, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
