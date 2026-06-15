import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkAuth } from '../../../../lib/auth';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!fs.existsSync(TASKS_FILE)) {
    return NextResponse.json([]);
  }

  const content = fs.readFileSync(TASKS_FILE, 'utf-8');
  return NextResponse.json(JSON.parse(content));
}
