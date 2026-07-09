import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/reviews.xml' }
];

async function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (error) {
      console.warn('Could not create data directory, possibly read-only filesystem:', error);
    }
  }
}

function loadData<T>(filePath: string, defaultValue: T): T {
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return defaultValue;
  }
}

function saveData(filePath: string, data: unknown) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EROFS') {
      console.warn(`Read-only filesystem encountered when saving to ${filePath}.`);
    } else {
      console.error(`Error saving data to ${filePath}:`, error);
    }
  }
}

export async function runBenchmark() {
  await ensureDataDir();

  const record = loadData<BenchmarkRecord>(BENCHMARK_FILE, {
    lastRun: new Date(0).toISOString(),
    processedUrls: []
  });

  const currentTasks = loadData<Task[]>(TASKS_FILE, []);
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Fetching feed for ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        if (!item.link || record.processedUrls.includes(item.link)) continue;

        // Simple content gap logic: if we don't have it, it's a gap
        // In a real app, you'd check your own database of slugs/titles

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Analyser : ${item.title || 'Sans titre'}`,
          description: `Nouveau contenu détecté chez ${competitor.name}. Évaluer l'opportunité de créer un guide ou une review similaire pour reviewguid.com.`,
          sourceUrl: item.link,
          competitor: competitor.name,
          status: 'todo',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        record.processedUrls.push(item.link);
      }
    } catch (error) {
      console.error(`Failed to fetch ${competitor.name} feed:`, error);
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...currentTasks];
    saveData(TASKS_FILE, updatedTasks);
    console.log(`Created ${newTasks.length} new tasks.`);
  }

  record.lastRun = new Date().toISOString();
  // Keep only the last 500 processed URLs to avoid file bloat
  if (record.processedUrls.length > 500) {
    record.processedUrls = record.processedUrls.slice(-500);
  }
  saveData(BENCHMARK_FILE, record);

  return {
    success: true,
    newTasksCount: newTasks.length,
    timestamp: record.lastRun
  };
}
