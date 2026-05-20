import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';

const parser = new Parser();

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/reviews.rss' }
];

const BENCHMARKS_FILE = path.join(process.cwd(), 'src/lib/benchmarks.json');
const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');

function loadData<T>(filePath: string): T[] {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

function saveData<T>(filePath: string, data: T[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function runBenchmark() {
  const existingBenchmarks = loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const existingTasks = loadData<Task>(TASKS_FILE);

  const newBenchmarks: BenchmarkRecord[] = [...existingBenchmarks];
  const newTasks: Task[] = [...existingTasks];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        const alreadyBenchmarked = existingBenchmarks.some(b => b.url === item.link);

        if (!alreadyBenchmarked) {
          const record: BenchmarkRecord = {
            id: Math.random().toString(36).substr(2, 9),
            url: item.link,
            title: item.title,
            competitor: competitor.name as 'Wirecutter' | 'RTINGS',
            publishedAt: item.pubDate || new Date().toISOString(),
            discoveredAt: new Date().toISOString()
          };

          newBenchmarks.push(record);

          const task: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title: `Review competitor article: ${item.title}`,
            description: `A new article was found on ${competitor.name}. Analyze it for content gaps or updates.`,
            sourceUrl: item.link,
            competitor: competitor.name as 'Wirecutter' | 'RTINGS',
            status: 'pending',
            priority: 'medium',
            createdAt: new Date().toISOString()
          };

          newTasks.push(task);
        }
      }
    } catch (error) {
      console.error(`Error fetching feed for ${competitor.name}:`, error);
    }
  }

  saveData(BENCHMARKS_FILE, newBenchmarks);
  saveData(TASKS_FILE, newTasks);

  return {
    newBenchmarksCount: newBenchmarks.length - existingBenchmarks.length,
    newTasksCount: newTasks.length - existingTasks.length
  };
}
