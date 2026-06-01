import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(data);

    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    tasks[taskIndex].status = status;

    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));

    return NextResponse.json({ success: true, task: tasks[taskIndex] });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
