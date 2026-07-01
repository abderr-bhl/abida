import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');
const BENCHMARK_RECORD_FILE = path.join(process.cwd(), 'data/benchmark_record.json');

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

async function loadData<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem, skipping save.');
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  const tasks = await loadData<Task[]>(TASKS_FILE, []);
  const record = await loadData<BenchmarkRecord>(BENCHMARK_RECORD_FILE, {
    lastRun: '',
    processedUrls: [],
  });

  const newTasks: Task[] = [];
  const processedUrls = [...record.processedUrls];

  for (const feed of FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);

      for (const item of feedData.items) {
        if (!item.link || processedUrls.includes(item.link)) continue;

        const task: Task = {
          id: crypto.randomUUID(),
          title: `Analyser : ${item.title || 'Nouveau contenu'}`,
          description: `Nouveau contenu identifié chez ${feed.name}. Titre : ${item.title}. Résumé : ${item.contentSnippet || 'Non disponible'}.`,
          sourceUrl: item.link,
          competitor: feed.name as 'Wirecutter' | 'RTINGS',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newTasks.push(task);
        processedUrls.push(item.link);
      }
    } catch (error) {
      console.error(`Error fetching feed ${feed.name}:`, error);
    }
  }

  const updatedTasks = [...newTasks, ...tasks];
  // Limit to 100 tasks for demo
  const finalTasks = updatedTasks.slice(0, 100);

  await saveData(TASKS_FILE, finalTasks);
  await saveData(BENCHMARK_RECORD_FILE, {
    lastRun: new Date().toISOString(),
    processedUrls: processedUrls.slice(-500), // Keep last 500 URLs
  });

  return {
    newTasksCount: newTasks.length,
    totalTasks: finalTasks.length,
  };
}
