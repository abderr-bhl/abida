import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';
import crypto from 'crypto';

const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');
const BENCHMARK_FILE = path.join(process.cwd(), 'data/benchmark.json');

const COMPETITORS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

const parser = new Parser();

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
}

function loadTasks(): Task[] {
  ensureDataDir();
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Filesystem is read-only. Tasks not persisted to disk.');
    } else {
      throw error;
    }
  }
}

function saveBenchmarkRecord(record: BenchmarkRecord) {
  ensureDataDir();
  try {
    fs.writeFileSync(BENCHMARK_FILE, JSON.stringify(record, null, 2));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Filesystem is read-only. Benchmark record not persisted.');
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  const tasks = loadTasks();
  let newTasksCount = 0;
  let totalFound = 0;

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.url);
      totalFound += feed.items.length;

      for (const item of feed.items) {
        const alreadyExists = tasks.find(t => t.sourceUrl === item.link);

        if (!alreadyExists) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title}`,
            description: `Nouveau contenu détecté chez ${competitor.name}. À évaluer pour ReviewGuid.`,
            status: 'pending',
            createdAt: new Date().toISOString(),
            sourceUrl: item.link || '',
            competitor: competitor.name
          };
          tasks.push(newTask);
          newTasksCount++;
        }
      }
    } catch (error) {
      console.error(`Error benchmarking ${competitor.name}:`, error);
    }
  }

  saveTasks(tasks);

  const record: BenchmarkRecord = {
    lastRun: new Date().toISOString(),
    foundItems: totalFound,
    newTasks: newTasksCount
  };
  saveBenchmarkRecord(record);

  return record;
}
