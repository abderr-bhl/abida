import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const COMPETITORS = [
  { name: 'Wirecutter' as const, feed: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS' as const, feed: 'https://www.rtings.com/rss/reviews.xml' }
];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
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
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

async function saveBenchmarkRecord(record: BenchmarkRecord) {
  await fs.writeFile(BENCHMARK_FILE, JSON.stringify(record, null, 2));
}

export async function runBenchmark() {
  await ensureDataDir();
  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  let newTasksCount = 0;
  const newTasks: Task[] = [];

  for (const comp of COMPETITORS) {
    try {
      const feed = await parser.parseURL(comp.feed);
      for (const item of feed.items) {
        if (item.link && !existingUrls.has(item.link)) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title || 'Nouveau contenu'}`,
            description: `Le concurrent ${comp.name} a publié un nouvel article : ${item.title}. Analyser pour opportunité de contenu.`,
            sourceUrl: item.link,
            competitor: comp.name,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          newTasks.push(newTask);
          newTasksCount++;
        }
      }
    } catch (error) {
      console.error(`Error fetching feed for ${comp.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveTasks([...newTasks, ...existingTasks]);
  }

  const record: BenchmarkRecord = {
    lastRun: new Date().toISOString(),
    tasksGenerated: newTasksCount
  };
  await saveBenchmarkRecord(record);

  return record;
}
