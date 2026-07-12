import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();

const COMPETITORS = [
  {
    name: 'Wirecutter',
    rssUrl: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    rssUrl: 'https://www.rtings.com/rss/reviews.xml',
  }
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
}

function loadData<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [];
  }
}

function saveData<T>(filePath: string, data: T[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    // Handle read-only filesystem (Vercel)
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn(`Warning: Could not save to ${filePath} (read-only filesystem). This is expected on Vercel. For production, replace local JSON persistence with a database.`);
    } else {
      console.error(`Error saving data to ${filePath}:`, error);
    }
  }
}

export async function runBenchmark() {
  ensureDataDir();
  const tasks = loadData<Task>(TASKS_FILE);
  const benchmarkRecords = loadData<BenchmarkRecord>(BENCHMARK_FILE);
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Checking ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.rssUrl);
      const record = benchmarkRecords.find(r => r.competitor === competitor.name);

      const latestItem = feed.items[0];
      if (!latestItem) continue;

      if (!record || record.lastArticleUrl !== latestItem.link) {
        // New content found
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${latestItem.title || 'Unknown Title'}`,
          description: `Competitor ${competitor.name} published a new article. Analyze and create a counter-article or updated guide.`,
          status: 'pending',
          sourceUrl: latestItem.link,
          competitor: competitor.name,
          category: (latestItem.categories && latestItem.categories[0]) || 'General',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newTasks.push(newTask);

        // Update record
        if (record) {
          record.lastChecked = new Date().toISOString();
          record.lastArticleTitle = latestItem.title;
          record.lastArticleUrl = latestItem.link;
        } else {
          benchmarkRecords.push({
            id: crypto.randomUUID(),
            competitor: competitor.name,
            lastChecked: new Date().toISOString(),
            lastArticleTitle: latestItem.title,
            lastArticleUrl: latestItem.link,
          });
        }
      }
    } catch (error) {
      console.error(`Error checking ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...tasks];
    saveData(TASKS_FILE, updatedTasks);
    saveData(BENCHMARK_FILE, benchmarkRecords);
    return { success: true, count: newTasks.length };
  }

  return { success: true, count: 0 };
}

export function getTasks() {
  return loadData<Task>(TASKS_FILE);
}

export function updateTaskStatus(taskId: string, status: Task['status']) {
  const tasks = loadData<Task>(TASKS_FILE);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = status;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    saveData(TASKS_FILE, tasks);
    return true;
  }
  return false;
}
