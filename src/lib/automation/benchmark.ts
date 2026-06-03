import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARKS_FILE = path.join(DATA_DIR, 'benchmarks.json');

const parser = new Parser();

const COMPETITORS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/news.rss' }
];

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(BENCHMARKS_FILE)) {
    fs.writeFileSync(BENCHMARKS_FILE, JSON.stringify([]));
  }
}

function loadData<T>(filePath: string): T[] {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') return [];
    throw error;
  }
}

function saveData<T>(filePath: string, data: T[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Filesystem is read-only, skipping persistence');
      return;
    }
    throw error;
  }
}

export async function runBenchmark() {
  ensureDataFiles();

  const tasks = loadData<Task>(TASKS_FILE);
  const benchmarks = loadData<BenchmarkRecord>(BENCHMARKS_FILE);

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Checking ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.url);

      const lastRecord = benchmarks.find(b => b.competitor === competitor.name);
      const lastCheckDate = lastRecord ? new Date(lastRecord.lastChecked) : new Date(0);

      let newArticlesCount = 0;

      for (const item of feed.items) {
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

        if (pubDate > lastCheckDate) {
          // Check if task already exists
          const exists = tasks.some(t => t.url === item.link);

          if (!exists) {
            const newTask: Task = {
              id: crypto.randomUUID(),
              title: `New competitor article: ${item.title}`,
              description: `A new article was published on ${competitor.name}: ${item.title}. Evaluate if we need to cover this topic.`,
              source: competitor.name,
              url: item.link || '',
              priority: 'medium',
              status: 'pending',
              createdAt: new Date().toISOString()
            };
            tasks.push(newTask);
            newArticlesCount++;
          }
        }
      }

      if (lastRecord) {
        lastRecord.lastChecked = new Date().toISOString();
        lastRecord.articlesProcessed += newArticlesCount;
      } else {
        benchmarks.push({
          id: crypto.randomUUID(),
          competitor: competitor.name,
          lastChecked: new Date().toISOString(),
          articlesProcessed: newArticlesCount
        });
      }

      console.log(`Processed ${newArticlesCount} new articles from ${competitor.name}`);
    } catch (error) {
      console.error(`Error processing ${competitor.name}:`, error);
    }
  }

  saveData(TASKS_FILE, tasks);
  saveData(BENCHMARKS_FILE, benchmarks);

  return { tasksAdded: tasks.length, benchmarks };
}
