import Parser from 'rss-parser';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Task, BenchmarkRecord } from '@/types';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

const parser = new Parser();

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }
}

async function readTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') return [];
    throw error;
  }
}

async function saveTasks(tasks: Task[]) {
  try {
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EROFS') {
      console.warn('Filesystem is read-only. Task data not persisted.');
      return;
    }
    throw error;
  }
}

async function saveBenchmarkResult(record: BenchmarkRecord) {
  try {
    await fs.writeFile(BENCHMARK_FILE, JSON.stringify(record, null, 2));
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EROFS') {
      console.warn('Filesystem is read-only. Benchmark record not persisted.');
      return;
    }
    throw error;
  }
}

export async function runBenchmark() {
  await ensureDataDir();
  const existingTasks = await readTasks();
  let newTasksCount = 0;

  for (const feed of FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);

      for (const item of feedData.items) {
        const alreadyExists = existingTasks.some(t => t.sourceUrl === item.link);

        if (!alreadyExists && item.link) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title || 'Nouvel article'}`,
            description: `Nouvel article détecté sur ${feed.name}. Évaluer la pertinence pour ReviewGuid USA.`,
            status: 'pending',
            priority: 'medium',
            sourceUrl: item.link,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          existingTasks.unshift(newTask);
          newTasksCount++;
        }
      }
    } catch (error) {
      console.error(`Error parsing feed ${feed.name}:`, error);
    }
  }

  if (newTasksCount > 0) {
    await saveTasks(existingTasks);
  }

  const record: BenchmarkRecord = {
    id: crypto.randomUUID(),
    lastRun: new Date().toISOString(),
    status: 'success',
    newTasksFound: newTasksCount,
  };

  await saveBenchmarkResult(record);
  return record;
}
