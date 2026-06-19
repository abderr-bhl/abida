import Parser from 'rss-parser';
import { Task, BenchmarkRecord } from '@/types';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const parser = new Parser();

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');
const RECORDS_FILE = path.join(process.cwd(), 'data/benchmark_records.json');

export function getTasks() {
  return loadData<Task>(TASKS_FILE);
}

export function saveTasks(tasks: Task[]) {
  saveData(TASKS_FILE, tasks);
}

export async function runBenchmark() {
  const records = loadData<BenchmarkRecord>(RECORDS_FILE);
  const tasks = getTasks();
  let newTasksCount = 0;

  for (const feed of FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);

      for (const item of feedData.items) {
        if (!item.link || !item.title) continue;

        const alreadyTracked = records.some((r) => r.url === item.link);
        if (!alreadyTracked) {
          // New article found
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title}`,
            description: `Nouvel article détecté sur ${feed.name}. Évaluer le potentiel pour reviewguid.com.`,
            status: 'pending',
            priority: 'medium',
            competitorUrl: item.link,
            competitorName: feed.name,
            createdAt: new Date().toISOString(),
          };

          const newRecord: BenchmarkRecord = {
            id: crypto.randomUUID(),
            url: item.link,
            title: item.title,
            competitor: feed.name as 'Wirecutter' | 'RTINGS',
            discoveredAt: new Date().toISOString(),
          };

          tasks.unshift(newTask);
          records.push(newRecord);
          newTasksCount++;
        }
      }
    } catch (error) {
      console.error(`Error fetching feed ${feed.name}:`, error);
    }
  }

  if (newTasksCount > 0) {
    saveData(TASKS_FILE, tasks);
    saveData(RECORDS_FILE, records);
  }

  return { newTasksCount };
}

function loadData<T>(filePath: string): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Filesystem is read-only. Returning empty array.');
    } else {
      console.error(`Error reading ${filePath}:`, error);
    }
  }
  return [];
}

function saveData(filePath: string, data: unknown) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Filesystem is read-only. Cannot save data.');
    } else {
      console.error(`Error saving to ${filePath}:`, error);
    }
  }
}
