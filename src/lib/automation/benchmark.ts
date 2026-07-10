import Parser from 'rss-parser';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const DATA_PATH = path.join(process.cwd(), 'data/tasks.json');
const BENCHMARK_PATH = path.join(process.cwd(), 'data/benchmark.json');

const parser = new Parser();

const COMPETITORS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

async function ensureDataFiles() {
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });

    try {
      await fs.access(DATA_PATH);
    } catch {
      await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));
    }

    try {
      await fs.access(BENCHMARK_PATH);
    } catch {
      await fs.writeFile(BENCHMARK_PATH, JSON.stringify({
        lastRun: new Date(0).toISOString(),
        competitorsProcessed: [],
        tasksGenerated: 0
      }, null, 2));
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Filesystem is read-only. Data persistence might fail.');
    } else {
      throw error;
    }
  }
}

async function loadData<T>(filePath: string): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [] as unknown as T;
  }
}

async function saveData<T>(filePath: string, data: T) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn(`Cannot save to ${filePath}: Read-only filesystem.`);
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  await ensureDataFiles();

  const tasks = await loadData<Task[]>(DATA_PATH);
  const record = await loadData<BenchmarkRecord>(BENCHMARK_PATH);

  let tasksGeneratedCount = 0;
  const processedUrls = new Set(tasks.map(t => t.competitorUrl));

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.url);

      for (const item of feed.items) {
        if (!item.link || processedUrls.has(item.link)) continue;

        // Skip items older than last run
        if (item.pubDate && new Date(item.pubDate) <= new Date(record.lastRun)) continue;

        const taskType = identifyTaskType(item.title || '', item.link);

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${item.title}`,
          description: item.contentSnippet || item.content || 'No description available',
          type: taskType,
          status: 'pending',
          priority: 'medium',
          competitorUrl: item.link,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        tasksGeneratedCount++;
        processedUrls.add(item.link);
      }
    } catch (error) {
      console.error(`Error processing competitor ${competitor.name}:`, error);
    }
  }

  if (tasksGeneratedCount > 0) {
    await saveData(DATA_PATH, tasks);
  }

  const updatedRecord: BenchmarkRecord = {
    lastRun: new Date().toISOString(),
    competitorsProcessed: COMPETITORS.map(c => c.name),
    tasksGenerated: record.tasksGenerated + tasksGeneratedCount
  };

  await saveData(BENCHMARK_PATH, updatedRecord);

  return {
    tasksGenerated: tasksGeneratedCount,
    totalTasks: tasks.length
  };
}

function identifyTaskType(title: string, url: string): Task['type'] {
  const t = title.toLowerCase();
  const u = url.toLowerCase();

  if (t.includes('vs') || u.includes('comparison')) return 'comparison';
  if (t.includes('best') || t.includes('guide') || u.includes('guides')) return 'guide';
  if (t.includes('news') || t.includes('update')) return 'news';

  return 'review';
}
