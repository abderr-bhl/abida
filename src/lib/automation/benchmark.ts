import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();

const COMPETITORS = [
  {
    name: 'Wirecutter',
    rssUrl: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    rssUrl: 'https://www.rtings.com/rss/reviews.rss',
  },
];

const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');
const BENCHMARK_FILE = path.join(process.cwd(), 'data/benchmark.json');

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readData<T>(filePath: string, defaultData: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultData;
}

function saveData(filePath: string, data: unknown) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EROFS') {
      console.warn('Filesystem is read-only. Data not persisted to disk.');
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  await ensureDataDir();

  const tasks = readData<Task[]>(TASKS_FILE, []);
  const benchmarks = readData<BenchmarkRecord[]>(BENCHMARK_FILE, []);

  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rssUrl);
      const lastBenchmark = benchmarks.find(b => b.competitorName === competitor.name);

      // Get the latest items from the feed (limit to 5)
      const items = feed.items.slice(0, 5);

      for (const item of items) {
        // If we haven't seen this article yet
        if (!lastBenchmark || (item.link && item.link !== lastBenchmark.lastArticleUrl)) {
          // Check if this article link is already in existing tasks
          const existingTask = tasks.find(t => t.sourceUrl === item.link);
          if (!existingTask) {
            const task: Task = {
              id: crypto.randomUUID(),
              title: `Analyser : ${item.title || 'Nouvel article'}`,
              description: `Concurrent ${competitor.name} a publié : ${item.title}. Analyser pour opportunité de contenu.`,
              status: 'pending',
              priority: 'medium',
              sourceUrl: item.link,
              competitor: competitor.name,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            newTasks.push(task);
          }
        }
      }

      // Update benchmark record for this competitor
      if (items.length > 0 && items[0].link) {
        const benchmarkIdx = benchmarks.findIndex(b => b.competitorName === competitor.name);
        const record: BenchmarkRecord = {
          id: lastBenchmark?.id || crypto.randomUUID(),
          competitorName: competitor.name,
          lastCheckedAt: new Date().toISOString(),
          lastArticleTitle: items[0].title || '',
          lastArticleUrl: items[0].link || '',
        };

        if (benchmarkIdx > -1) {
          benchmarks[benchmarkIdx] = record;
        } else {
          benchmarks.push(record);
        }
      }
    } catch (error) {
      console.error(`Error benchmarking ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...tasks];
    saveData(TASKS_FILE, updatedTasks);
  }

  saveData(BENCHMARK_FILE, benchmarks);

  return {
    newTasksCount: newTasks.length,
    totalTasksCount: tasks.length + newTasks.length
  };
}
