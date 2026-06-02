import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Task } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function GET() {
  if (!fs.existsSync(TASKS_FILE)) {
    return NextResponse.json([]);
  }

  try {
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    const tasks = JSON.parse(content);
    return NextResponse.json(tasks);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 });
  }
}
