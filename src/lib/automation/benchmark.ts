import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const BENCHMARKS_PATH = path.join(process.cwd(), 'src/lib/benchmarks.json');
const TASKS_PATH = path.join(process.cwd(), 'src/lib/tasks.json');

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/reviews.rss' }
];

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [];
  }
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
  }
}

export async function runBenchmark() {
  const existingBenchmarks = await loadData<BenchmarkRecord>(BENCHMARKS_PATH);
  const existingTasks = await loadData<Task>(TASKS_PATH);

  const newBenchmarks: BenchmarkRecord[] = [...existingBenchmarks];
  const newTasks: Task[] = [...existingTasks];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        const isNew = !existingBenchmarks.find(b => b.url === item.link);

        if (isNew && item.link && item.title) {
          const record: BenchmarkRecord = {
            id: Math.random().toString(36).substr(2, 9),
            competitor: competitor.name,
            title: item.title,
            url: item.link,
            publishedAt: item.pubDate || new Date().toISOString(),
            detectedAt: new Date().toISOString()
          };

          newBenchmarks.push(record);

          // Create an automated task based on competitor activity
          const task: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title: `Analyze: ${item.title}`,
            description: `New content detected from ${competitor.name}. Evaluate if we need to update our guides or create a new review.`,
            status: 'pending',
            priority: 'medium',
            type: 'competitor-update',
            sourceUrl: item.link,
            createdAt: new Date().toISOString()
          };

          newTasks.push(task);
        }
      }
    } catch (error) {
      console.error(`Error benchmarking ${competitor.name}:`, error);
    }
  }

  await saveData(BENCHMARKS_PATH, newBenchmarks);
  await saveData(TASKS_PATH, newTasks);

  return {
    addedBenchmarks: newBenchmarks.length - existingBenchmarks.length,
    addedTasks: newTasks.length - existingTasks.length
  };
}
