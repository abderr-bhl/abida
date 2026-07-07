import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();

const SOURCES = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (error: unknown) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem. Persistence disabled.');
      } else {
        throw error;
      }
    }
  }
}

async function loadData<T>(filePath: string, defaultValue: T): Promise<T> {
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return defaultValue;
  }
}

async function saveData(filePath: string, data: unknown): Promise<boolean> {
  ensureDataDir();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn(`Warning: Could not save to ${filePath} due to read-only filesystem.`);
      return false;
    }
    throw error;
  }
}

export async function runBenchmark() {
  console.log('Starting competitive benchmark...');
  const tasks = await loadData<Task[]>(TASKS_FILE, []);
  let newTasksCount = 0;

  for (const source of SOURCES) {
    try {
      console.log(`Fetching feed from ${source.name}...`);
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items) {
        const existingTask = tasks.find(t => t.sourceUrl === item.link);

        if (!existingTask && item.link) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title || 'Nouvel article'}`,
            description: `Le concurrent ${source.name} a publié un nouvel article : ${item.title}. Analyser pour identifier des opportunités de contenu.`,
            status: 'pending',
            sourceUrl: item.link,
            competitor: source.name,
            createdAt: new Date().toISOString()
          };
          tasks.push(newTask);
          newTasksCount++;
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${source.name}:`, error);
    }
  }

  if (newTasksCount > 0) {
    await saveData(TASKS_FILE, tasks);
  }

  const record: BenchmarkRecord = {
    lastRun: new Date().toISOString(),
    newTasksCount
  };
  await saveData(BENCHMARK_FILE, record);

  console.log(`Benchmark complete. Found ${newTasksCount} new tasks.`);
  return record;
}
