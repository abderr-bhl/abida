import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';
import crypto from 'crypto';

const parser = new Parser();

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/reviews.xml' }
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadTasks(): Task[] {
  ensureDataDir();
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  } catch (e) {
    console.error('Error loading tasks:', e);
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (e: unknown) {
    const error = e as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('Warning: Read-only filesystem. Tasks not saved permanently.');
    } else {
      console.error('Error saving tasks:', e);
    }
  }
}

function loadBenchmark(): BenchmarkRecord {
  ensureDataDir();
  if (!fs.existsSync(BENCHMARK_FILE)) {
    return { lastRun: '', processedUrls: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(BENCHMARK_FILE, 'utf8'));
  } catch (e) {
    console.error('Error loading benchmark:', e);
    return { lastRun: '', processedUrls: [] };
  }
}

function saveBenchmark(record: BenchmarkRecord) {
  ensureDataDir();
  try {
    fs.writeFileSync(BENCHMARK_FILE, JSON.stringify(record, null, 2));
  } catch (e: unknown) {
    const error = e as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('Warning: Read-only filesystem. Benchmark not saved permanently.');
    } else {
      console.error('Error saving benchmark:', e);
    }
  }
}

export async function runBenchmark() {
  const benchmark = loadBenchmark();
  const tasks = loadTasks();
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Fetching RSS for ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        if (item.link && !benchmark.processedUrls.includes(item.link)) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title || 'Unknown Title'}`,
            description: `Analyze competitor article and create our own version: ${item.title}`,
            sourceUrl: item.link,
            competitor: competitor.name,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          newTasks.push(newTask);
          benchmark.processedUrls.push(item.link);
        }
      }
    } catch (e) {
      console.error(`Error processing ${competitor.name}:`, e);
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...tasks];
    saveTasks(updatedTasks);
  }

  benchmark.lastRun = new Date().toISOString();
  // Keep only last 500 processed URLs to avoid file bloat
  if (benchmark.processedUrls.length > 500) {
    benchmark.processedUrls = benchmark.processedUrls.slice(-500);
  }
  saveBenchmark(benchmark);

  return newTasks;
}

export function getTasks() {
  return loadTasks();
}

export function updateTaskStatus(id: string, status: Task['status']) {
  const tasks = loadTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index].status = status;
    saveTasks(tasks);
    return true;
  }
  return false;
}
