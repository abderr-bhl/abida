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
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

async function loadData<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function saveData(filePath: string, data: unknown) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn(`Filesystem is read-only. Cannot save to ${filePath}`);
    } else {
      console.error(`Failed to save data to ${filePath}:`, error);
    }
  }
}

export async function runBenchmark() {
  await ensureDataDir();

  const benchmarkRecord = await loadData<BenchmarkRecord>(BENCHMARK_FILE, {
    lastRun: new Date(0).toISOString(),
    processedUrls: [],
  });

  const tasks = await loadData<Task[]>(TASKS_FILE, []);
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Fetching feed for ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.url);

      for (const item of feed.items) {
        if (!item.link || benchmarkRecord.processedUrls.includes(item.link)) continue;

        // Simple logic to identify potential tasks (e.g., new reviews or guides)
        const isNewRelevantContent =
          item.title?.toLowerCase().includes('review') ||
          item.title?.toLowerCase().includes('best') ||
          item.title?.toLowerCase().includes('guide');

        if (isNewRelevantContent) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title}`,
            description: `Nouveau contenu détecté chez ${competitor.name}. Évaluer s'il est pertinent de créer un contenu similaire pour reviewguid.com.\n\nSource: ${item.link}`,
            status: 'pending',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            sourceUrl: item.link,
            competitor: competitor.name,
          };
          newTasks.push(newTask);
          benchmarkRecord.processedUrls.push(item.link);
        }
      }
    } catch (error) {
      console.error(`Error fetching feed for ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...tasks];
    await saveData(TASKS_FILE, updatedTasks);
    console.log(`${newTasks.length} new tasks created.`);
  }

  benchmarkRecord.lastRun = new Date().toISOString();
  // Keep only the last 500 URLs to avoid huge files
  if (benchmarkRecord.processedUrls.length > 500) {
    benchmarkRecord.processedUrls = benchmarkRecord.processedUrls.slice(-500);
  }
  await saveData(BENCHMARK_FILE, benchmarkRecord);

  return newTasks;
}
