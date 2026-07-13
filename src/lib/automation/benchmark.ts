import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const DATA_FILE = path.join(process.cwd(), 'data', 'tasks.json');

const COMPETITORS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
] as const;

async function loadTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

async function saveTasks(tasks: Task[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Filesystem is read-only. Skipping save.');
    } else {
      console.error('Error saving tasks:', error);
    }
  }
}

export async function runBenchmark(): Promise<BenchmarkRecord> {
  const existingTasks = await loadTasks();
  let newTasksFound = 0;
  const now = new Date().toISOString();

  for (const comp of COMPETITORS) {
    try {
      const feed = await parser.parseURL(comp.url);

      for (const item of feed.items) {
        const exists = existingTasks.find(t => t.url === item.link);
        if (!exists) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title || 'Untitled'}`,
            description: `New content from ${comp.name}. Check if we need to cover this.`,
            competitor: comp.name,
            url: item.link || '',
            status: 'pending',
            createdAt: now
          };
          existingTasks.unshift(newTask);
          newTasksFound++;
        }
      }
    } catch (error) {
      console.error(`Error fetching feed for ${comp.name}:`, error);
    }
  }

  if (newTasksFound > 0) {
    await saveTasks(existingTasks);
  }

  return {
    lastRun: now,
    status: 'success',
    newTasksFound
  };
}
