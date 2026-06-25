import Parser from 'rss-parser';
import * as fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const parser = new Parser();

const COMPETITORS = [
  {
    name: 'Wirecutter',
    rssUrl: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    rssUrl: 'https://www.rtings.com/rss/reviews.xml',
  },
];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (_error) {
    console.warn('Failed to create data directory, might be on a read-only filesystem');
  }
}

async function loadData<T>(filepath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveData(filepath: string, data: unknown) {
  try {
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.error(`Cannot save to ${filepath}: Read-only filesystem`);
    } else {
      console.error(`Error saving data to ${filepath}:`, error);
    }
  }
}

export async function runBenchmark() {
  await ensureDataDir();

  const tasks = await loadData<Task>(TASKS_FILE);
  const records = await loadData<BenchmarkRecord>(BENCHMARK_FILE);
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Checking ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.rssUrl);

      const record = records.find(r => r.competitor === competitor.name) || {
        id: crypto.randomUUID(),
        competitor: competitor.name,
        lastChecked: new Date(0).toISOString(),
      };

      const latestItems = feed.items.filter(item => {
        const itemDate = item.pubDate ? new Date(item.pubDate) : new Date();
        return itemDate > new Date(record.lastChecked);
      });

      for (const item of latestItems) {
        // Avoid duplicates if title/url already exists in tasks
        if (tasks.some(t => t.sourceUrl === item.link) || newTasks.some(t => t.sourceUrl === item.link)) {
          continue;
        }

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Analyser : ${item.title}`,
          description: `Nouveau contenu détecté chez ${competitor.name}. Lien: ${item.link}`,
          source: competitor.name,
          sourceUrl: item.link || '',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newTasks.push(newTask);
      }

      if (feed.items.length > 0) {
        const newest = feed.items[0];
        record.lastChecked = new Date().toISOString();
        record.lastArticleTitle = newest.title;
        record.lastArticleUrl = newest.link;

        const existingRecordIndex = records.findIndex(r => r.competitor === competitor.name);
        if (existingRecordIndex >= 0) {
          records[existingRecordIndex] = record;
        } else {
          records.push(record);
        }
      }
    } catch (error) {
      console.error(`Failed to benchmark ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...tasks];
    await saveData(TASKS_FILE, updatedTasks);
  }
  await saveData(BENCHMARK_FILE, records);

  return {
    newTasksCount: newTasks.length,
    totalTasks: tasks.length + newTasks.length,
  };
}

export async function getTasks(): Promise<Task[]> {
  return loadData<Task>(TASKS_FILE);
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<boolean> {
  const tasks = await loadData<Task>(TASKS_FILE);
  const index = tasks.findIndex(t => t.id === taskId);
  if (index >= 0) {
    tasks[index].status = status;
    tasks[index].updatedAt = new Date().toISOString();
    await saveData(TASKS_FILE, tasks);
    return true;
  }
  return false;
}
