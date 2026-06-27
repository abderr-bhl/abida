import { Task } from '@/types';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import * as crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const SOURCES = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

async function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'EROFS') {
        console.warn('Read-only filesystem, cannot create data directory');
      } else {
        throw error;
      }
    }
  }
}

export async function getTasks(): Promise<Task[]> {
  await ensureDataDir();
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}

async function saveTasks(tasks: Task[]) {
  await ensureDataDir();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem, cannot save tasks');
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  const parser = new Parser();
  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: Task[] = [];

  for (const source of SOURCES) {
    try {
      console.log(`Fetching ${source.name}...`);
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items) {
        if (item.link && !existingUrls.has(item.link)) {
          newTasks.push({
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title || 'Sans titre'}`,
            description: `Nouvel article détecté sur ${source.name} : ${item.title}. Analyser pour ReviewGuid.`,
            sourceUrl: item.link,
            sourceName: source.name as 'Wirecutter' | 'RTINGS',
            status: 'pending',
            createdAt: new Date().toISOString(),
            priority: 'medium',
          });
        }
      }
    } catch (error) {
      console.error(`Error benchmarking ${source.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveTasks([...newTasks, ...existingTasks]);
  }

  return {
    tasksGenerated: newTasks.length,
    totalTasks: existingTasks.length + newTasks.length
  };
}
