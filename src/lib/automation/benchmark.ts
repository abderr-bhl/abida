import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/reviews.xml' }
];

const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');
const BENCHMARKS_FILE = path.join(process.cwd(), 'src/lib/benchmarks.json');

function ensureFile(filepath: string, defaultData: unknown) {
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
  }
}

function loadData<T>(filepath: string): T {
  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content) as T;
}

function saveData(filepath: string, data: unknown) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

export async function runBenchmark() {
  ensureFile(TASKS_FILE, []);
  ensureFile(BENCHMARKS_FILE, []);

  const tasks = loadData<Task[]>(TASKS_FILE);
  const benchmarks = loadData<BenchmarkRecord[]>(BENCHMARKS_FILE);
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);
      const lastCheck = benchmarks.find(b => b.siteName === competitor.name);

      const lastCheckedDate = lastCheck ? new Date(lastCheck.lastChecked) : new Date(0);
      let latestDate = lastCheckedDate;

      for (const item of feed.items) {
        const itemDate = item.pubDate ? new Date(item.pubDate) : new Date();

        if (itemDate > lastCheckedDate) {
          if (itemDate > latestDate) latestDate = itemDate;

          // Check if task already exists
          if (!tasks.some(t => t.url === item.link)) {
            newTasks.push({
              id: Math.random().toString(36).substring(2, 9),
              title: item.title || 'No Title',
              description: `Competitor ${competitor.name} published: ${item.contentSnippet || ''}`,
              source: competitor.name,
              url: item.link || '',
              status: 'pending',
              date: itemDate.toISOString()
            });
          }
        }
      }

      // Update benchmark record
      if (lastCheck) {
        lastCheck.lastChecked = latestDate.toISOString();
      } else {
        benchmarks.push({
          id: Math.random().toString(36).substring(2, 9),
          siteName: competitor.name,
          lastChecked: latestDate.toISOString()
        });
      }
    } catch (error) {
      console.error(`Failed to fetch ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    saveData(TASKS_FILE, [...tasks, ...newTasks]);
  }
  saveData(BENCHMARKS_FILE, benchmarks);

  return newTasks;
}
