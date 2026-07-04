import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const parser = new Parser();

const COMPETITORS = [
  {
    name: 'Wirecutter',
    rss: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    rss: 'https://www.rtings.com/rss/reviews.xml',
  },
];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Handle EROFS or other errors if needed
  }
}

async function loadTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]) {
  await ensureDataDir();
  try {
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem, cannot save tasks');
    } else {
      throw error;
    }
  }
}

async function saveBenchmarkRecord(record: BenchmarkRecord) {
  await ensureDataDir();
  try {
    await fs.writeFile(BENCHMARK_FILE, JSON.stringify(record, null, 2));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem, cannot save benchmark record');
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  const existingTasks = await loadTasks();
  let newTasksCount = 0;
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        const alreadyExists = existingTasks.some(t => t.sourceUrl === item.link);

        if (!alreadyExists) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title}`,
            description: `Nouveau contenu détecté sur ${competitor.name}. Évaluer si nous devons produire un guide similaire pour le marché USA.`,
            status: 'pending',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            sourceUrl: item.link,
            competitor: competitor.name
          };
          newTasks.push(newTask);
          newTasksCount++;
        }
      }
    } catch (error) {
      console.error(`Failed to fetch RSS for ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveTasks([...newTasks, ...existingTasks]);
  }

  const record: BenchmarkRecord = {
    lastRun: new Date().toISOString(),
    status: 'success',
    newTasksFound: newTasksCount
  };

  await saveBenchmarkRecord(record);
  return record;
}
