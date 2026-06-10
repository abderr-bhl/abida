import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const DATA_PATH = path.join(process.cwd(), 'data/tasks.json');
const BENCHMARK_LOG_PATH = path.join(process.cwd(), 'data/benchmark_log.json');

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/news.rss' }
];

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EROFS') {
      console.warn(`Filesystem is read-only. Could not save to ${filePath}`);
      return;
    }
    throw error;
  }
}

export async function runBenchmarking() {
  const existingTasks = await loadData<Task>(DATA_PATH);
  const benchmarkLogs = await loadData<BenchmarkRecord>(BENCHMARK_LOG_PATH);

  const newTasks: Task[] = [];
  const newLogs: BenchmarkRecord[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        const isAlreadyProcessed = benchmarkLogs.some(log => log.articleUrl === item.link);
        const isAlreadyTasked = existingTasks.some(task => task.sourceUrl === item.link);

        if (isAlreadyProcessed || isAlreadyTasked) continue;

        // Simple heuristic: if it's from Wirecutter/RTINGS, it's likely a guide or review
        const type = item.title?.toLowerCase().includes('best') ? 'guide' : 'review';

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Analyze: ${item.title}`,
          type: type as Task['type'],
          status: 'pending',
          priority: 'medium',
          sourceUrl: item.link,
          description: `Competitor ${competitor.name} published: ${item.title}. Evaluate for our site.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const log: BenchmarkRecord = {
          id: crypto.randomUUID(),
          competitor: competitor.name,
          articleTitle: item.title || 'Unknown Title',
          articleUrl: item.link || '',
          publishedDate: item.pubDate || new Date().toISOString(),
          processedAt: new Date().toISOString(),
          status: 'task_created',
        };

        newTasks.push(newTask);
        newLogs.push(log);
      }
    } catch (error) {
      console.error(`Failed to fetch RSS for ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveData(DATA_PATH, [...existingTasks, ...newTasks]);
    await saveData(BENCHMARK_LOG_PATH, [...benchmarkLogs, ...newLogs]);
  }

  return { tasksCreated: newTasks.length };
}
