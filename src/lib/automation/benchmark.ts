import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';
import crypto from 'crypto';

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

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

async function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function loadTasks(): Promise<Task[]> {
  await ensureDataDir();
  if (!fs.existsSync(TASKS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

async function saveTasks(tasks: Task[]) {
  await ensureDataDir();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error: unknown) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Warning: Filesystem is read-only. Task was not saved to disk.');
    } else {
      console.error('Error saving tasks:', error);
    }
  }
}

export async function runBenchmark() {
  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: Task[] = [];
  const scannedSources: string[] = [];

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Fetching RSS for ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.rssUrl);
      scannedSources.push(competitor.name);

      for (const item of feed.items) {
        if (item.link && !existingUrls.has(item.link)) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title}`,
            description: item.contentSnippet || item.summary || 'Nouvelle publication détectée.',
            sourceUrl: item.link,
            competitor: competitor.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          newTasks.push(newTask);
          existingUrls.add(item.link);
        }
      }
    } catch (error) {
      console.error(`Error fetching RSS for ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveTasks([...newTasks, ...existingTasks]);
  }

  const record: BenchmarkRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    tasksGenerated: newTasks.length,
    sourcesScanned: scannedSources,
  };

  return record;
}

export async function getTasks(): Promise<Task[]> {
  return await loadTasks();
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<boolean> {
  const tasks = await loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return false;

  tasks[taskIndex].status = status;
  tasks[taskIndex].updatedAt = new Date().toISOString();
  await saveTasks(tasks);
  return true;
}
