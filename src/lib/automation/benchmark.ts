import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';
import crypto from 'crypto';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/reviews.xml' },
];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      console.warn('Could not create data directory:', error);
    }
  }
}

async function loadData<T>(filepath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    return defaultValue;
  }
}

async function saveData(filepath: string, data: unknown) {
  try {
    await ensureDataDir();
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Failed to save data to ${filepath}:`, error);
  }
}

export async function runBenchmark() {
  const benchmarkRecord = await loadData<BenchmarkRecord>(BENCHMARK_FILE, {
    lastRun: new Date(0).toISOString(),
    processedUrls: [],
  });

  const currentTasks = await loadData<Task[]>(TASKS_FILE, []);
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        if (!item.link || benchmarkRecord.processedUrls.includes(item.link)) continue;

        // Simple logic: if we haven't seen this URL, it's a gap
        const task: Task = {
          id: crypto.randomUUID(),
          title: `Analyser : ${item.title || 'Nouvel article'}`,
          description: `Nouveau contenu détecté sur ${competitor.name}. Évaluer la pertinence pour ReviewGuid.`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          sourceUrl: item.link,
          competitor: competitor.name,
        };

        newTasks.push(task);
        benchmarkRecord.processedUrls.push(item.link);
      }
    } catch (error) {
      console.error(`Failed to fetch RSS for ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...currentTasks];
    await saveData(TASKS_FILE, updatedTasks);
  }

  benchmarkRecord.lastRun = new Date().toISOString();
  // Keep only last 500 URLs to avoid huge files
  if (benchmarkRecord.processedUrls.length > 500) {
    benchmarkRecord.processedUrls = benchmarkRecord.processedUrls.slice(-500);
  }
  await saveData(BENCHMARK_FILE, benchmarkRecord);

  return newTasks;
}

export async function getTasks(): Promise<Task[]> {
  return await loadData<Task[]>(TASKS_FILE, []);
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<boolean> {
  const tasks = await loadData<Task[]>(TASKS_FILE, []);
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) return false;

  tasks[taskIndex].status = status;
  await saveData(TASKS_FILE, tasks);
  return true;
}
