import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARKS_FILE = path.join(DATA_DIR, 'benchmarks.json');

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/news.rss' }
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
      await fs.access(BENCHMARKS_FILE);
    } catch {
      await fs.writeFile(BENCHMARKS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'EROFS') {
      console.error('Error ensuring data files:', error);
    }
  }
}

async function loadData<T>(file: string): Promise<T[]> {
  try {
    const content = await fs.readFile(file, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveData(file: string, data: unknown) {
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EROFS') {
      console.warn('Filesystem is read-only, could not save data to', file);
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  await ensureDataFiles();
  const tasks = await loadData<Task>(TASKS_FILE);
  const benchmarks = await loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);
      const lastBenchmark = benchmarks.find(b => b.competitor === competitor.name);

      const latestItems = feed.items.slice(0, 5); // Check latest 5 articles

      for (const item of latestItems) {
        if (lastBenchmark && lastBenchmark.lastArticleUrl === item.link) {
          break; // Already processed up to here
        }

        const taskType: Task['type'] = item.title?.toLowerCase().includes('best') ? 'guide' :
                          item.title?.toLowerCase().includes('review') ? 'review' :
                          item.title?.toLowerCase().includes('vs') ? 'comparison' : 'news';

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Response to ${competitor.name}: ${item.title}`,
          description: `Analyze and respond to competitor content: ${item.contentSnippet || 'No description available.'}`,
          sourceUrl: item.link || '',
          status: 'pending',
          createdAt: new Date().toISOString(),
          type: taskType
        };

        newTasks.push(newTask);
      }

      // Update benchmark record
      if (latestItems.length > 0) {
        const recordIndex = benchmarks.findIndex(b => b.competitor === competitor.name);
        const newRecord: BenchmarkRecord = {
          id: lastBenchmark?.id || crypto.randomUUID(),
          competitor: competitor.name,
          lastChecked: new Date().toISOString(),
          lastArticleUrl: latestItems[0].link || ''
        };

        if (recordIndex >= 0) {
          benchmarks[recordIndex] = newRecord;
        } else {
          benchmarks.push(newRecord);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch RSS for ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveData(TASKS_FILE, [...newTasks, ...tasks]);
    await saveData(BENCHMARKS_FILE, benchmarks);
  }

  return newTasks;
}
