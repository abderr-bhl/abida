import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';
import crypto from 'crypto';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const COMPETITORS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

async function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (error: unknown) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'EROFS') {
        throw error;
      }
      console.warn('Data directory creation failed (EROFS), skipping local persistence.');
    }
  }
}

async function loadData<T>(filePath: string, defaultValue: T): Promise<T> {
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return defaultValue;
    }
  }
  return defaultValue;
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn(`Cannot save to ${filePath} (EROFS). This is expected in some environments.`);
    } else {
      console.error(`Error saving to ${filePath}:`, error);
    }
  }
}

export async function runBenchmark() {
  await ensureDataDir();

  const existingTasks = await loadData<Task[]>(TASKS_FILE, []);
  const benchmarkRecord = await loadData<BenchmarkRecord>(BENCHMARK_FILE, {
    lastRun: new Date(0).toISOString(),
    competitorsChecked: [],
    tasksCreated: 0
  });

  const newTasks: Task[] = [];
  const competitorsChecked: string[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.url);
      competitorsChecked.push(competitor.name);

      for (const item of feed.items) {
        const publishDate = new Date(item.pubDate || item.isoDate || 0);
        const lastRunDate = new Date(benchmarkRecord.lastRun);

        if (publishDate > lastRunDate) {
          // Check if task already exists for this URL
          const exists = existingTasks.some(t => t.sourceUrl === item.link);
          if (!exists) {
            const task: Task = {
              id: crypto.randomUUID(),
              title: `Analyser : ${item.title || 'Nouvel article'}`,
              description: `Nouveau contenu détecté chez ${competitor.name}. Lien : ${item.link}`,
              status: 'pending',
              sourceUrl: item.link,
              competitor: competitor.name,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            newTasks.push(task);
          }
        }
      }
    } catch (error) {
      console.error(`Error benchmarking ${competitor.name}:`, error);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveData(TASKS_FILE, updatedTasks);

  const newRecord: BenchmarkRecord = {
    lastRun: new Date().toISOString(),
    competitorsChecked,
    tasksCreated: newTasks.length
  };
  await saveData(BENCHMARK_FILE, newRecord);

  return {
    tasksCreated: newTasks.length,
    competitorsChecked
  };
}
