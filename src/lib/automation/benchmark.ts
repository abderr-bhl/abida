import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';
import crypto from 'crypto';

const parser = new Parser();
const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');
const BENCHMARK_FILE = path.join(process.cwd(), 'data/benchmark.json');

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

async function loadData<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return defaultValue;
    }
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    console.error(`Error writing to ${filePath}:`, error);
  }
}

export async function runBenchmark() {
  const tasks = await loadData<Task[]>(TASKS_FILE, []);
  const benchmark = await loadData<BenchmarkRecord>(BENCHMARK_FILE, {
    lastRun: '',
    processedUrls: []
  });

  const newTasks: Task[] = [];
  const processedUrls = [...benchmark.processedUrls];

  for (const feed of FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);

      for (const item of feedData.items) {
        if (!item.link || processedUrls.includes(item.link)) continue;

        const type: Task['type'] = item.title?.toLowerCase().includes('best') ? 'guide' : 'review';

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Analyser : ${item.title || 'Nouveau contenu'}`,
          description: `Concurrent (${feed.name}) a publié : ${item.title}. Evaluer si nous devons produire un contenu similaire pour le marché USA.`,
          sourceUrl: item.link,
          status: 'pending',
          priority: 'medium',
          type: type,
          createdAt: new Date().toISOString()
        };

        newTasks.push(newTask);
        processedUrls.push(item.link);
      }
    } catch (error: unknown) {
      console.error(`Error parsing feed ${feed.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveData(TASKS_FILE, [...newTasks, ...tasks]);
  }

  await saveData(BENCHMARK_FILE, {
    lastRun: new Date().toISOString(),
    processedUrls: processedUrls.slice(-500) // Keep last 500
  });

  return newTasks.length;
}
