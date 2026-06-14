import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const COMPETITORS = [
  { name: 'Wirecutter', feed: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', feed: 'https://www.rtings.com/rss/news.rss' }
];

async function ensureDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
      await fs.access(TASKS_FILE);
    } catch {
      await fs.writeFile(TASKS_FILE, JSON.stringify([], null, 2));
    }

    try {
      await fs.access(BENCHMARK_FILE);
    } catch {
      await fs.writeFile(BENCHMARK_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data files:', error);
  }
}

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Handle EROFS or other FS errors for demo purposes
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem detected. Using in-memory fallback for demo.');
    }
    return [];
  }
}

async function saveData<T>(filePath: string, data: T[]): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
       console.error('Cannot save data: Read-only filesystem.');
    } else {
       console.error('Error saving data:', error);
    }
  }
}

export async function runBenchmark() {
  await ensureDataFiles();

  const existingTasks = await loadData<Task>(TASKS_FILE);
  const benchmarkHistory = await loadData<BenchmarkRecord>(BENCHMARK_FILE);

  const newTasks: Task[] = [];
  const newRecords: BenchmarkRecord[] = [];

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Fetching feed for ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.feed);

      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        const alreadyScanned = benchmarkHistory.some(r => r.articleUrl === item.link);
        if (alreadyScanned) continue;

        console.log(`Found new content: ${item.title}`);

        const taskId = crypto.randomUUID();
        const newTask: Task = {
          id: taskId,
          title: `Analyser : ${item.title}`,
          description: `Nouveau contenu détecté chez ${competitor.name}. Évaluer la pertinence pour reviewguid.com.`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          sourceUrl: item.link,
          competitor: competitor.name
        };

        const newRecord: BenchmarkRecord = {
          id: crypto.randomUUID(),
          competitor: competitor.name,
          articleTitle: item.title,
          articleUrl: item.link,
          scannedAt: new Date().toISOString()
        };

        newTasks.push(newTask);
        newRecords.push(newRecord);
      }
    } catch (error) {
      console.error(`Error fetching feed for ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveData(TASKS_FILE, [...existingTasks, ...newTasks]);
    await saveData(BENCHMARK_FILE, [...benchmarkHistory, ...newRecords]);
    console.log(`Benchmark complete. ${newTasks.length} new tasks created.`);
  } else {
    console.log('Benchmark complete. No new content found.');
  }

  return { newTasksCount: newTasks.length };
}
