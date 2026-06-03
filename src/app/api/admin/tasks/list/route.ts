import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Task } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function GET() {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return NextResponse.json([]);
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    const tasks = JSON.parse(data);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
