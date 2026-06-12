import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const COMPETITORS = [
  {
    name: 'Wirecutter',
    rss: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    rss: 'https://www.rtings.com/rss/news.rss',
  }
];

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(BENCHMARK_FILE)) {
    fs.writeFileSync(BENCHMARK_FILE, JSON.stringify([]));
  }
}

async function loadData<T>(file: string): Promise<T[]> {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
    return [];
  }
}

async function saveData(file: string, data: unknown): Promise<void> {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EROFS') {
      console.warn('Filesystem is read-only. Skipping save.');
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  ensureDataFiles();

  const tasks = await loadData<Task>(TASKS_FILE);
  const records = await loadData<BenchmarkRecord>(BENCHMARK_FILE);

  const newTasks: Task[] = [];
  const updatedRecords: BenchmarkRecord[] = [...records];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);
      const lastRecord = records.find(r => r.competitor === competitor.name);

      const latestItems = feed.items.slice(0, 5); // Check latest 5

      for (const item of latestItems) {
        if (!item.link) continue;

        // If we haven't seen this article yet
        if (!lastRecord || (item.isoDate && new Date(item.isoDate) > new Date(lastRecord.lastChecked))) {
          const taskId = crypto.randomUUID();
          const newTask: Task = {
            id: taskId,
            title: `Analyze: ${item.title}`,
            description: `New content from ${competitor.name}: ${item.contentSnippet || item.title}`,
            sourceUrl: item.link,
            status: 'pending',
            priority: 'medium',
            type: item.link.includes('review') ? 'review' : 'guide',
            createdAt: new Date().toISOString(),
          };

          // Avoid duplicates in the same run or existing tasks
          if (!tasks.some(t => t.sourceUrl === item.link) && !newTasks.some(t => t.sourceUrl === item.link)) {
            newTasks.push(newTask);
          }
        }
      }

      // Update record
      const recordIndex = updatedRecords.findIndex(r => r.competitor === competitor.name);
      const newRecord: BenchmarkRecord = {
        id: lastRecord?.id || crypto.randomUUID(),
        competitor: competitor.name,
        lastChecked: new Date().toISOString(),
        lastArticleUrl: feed.items[0]?.link || '',
      };

      if (recordIndex >= 0) {
        updatedRecords[recordIndex] = newRecord;
      } else {
        updatedRecords.push(newRecord);
      }

    } catch (error) {
      console.error(`Failed to fetch ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveData(TASKS_FILE, [...tasks, ...newTasks]);
  }
  await saveData(BENCHMARK_FILE, updatedRecords);

  return {
    tasksAdded: newTasks.length,
    competitorsChecked: COMPETITORS.length
  };
}
