import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Task } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!fs.existsSync(TASKS_FILE)) {
      return NextResponse.json({ error: 'Tasks file not found' }, { status: 404 });
    }

    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    const tasks: Task[] = JSON.parse(data);

    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    tasks[taskIndex].status = status;

    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));

    return NextResponse.json({ success: true, task: tasks[taskIndex] });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
