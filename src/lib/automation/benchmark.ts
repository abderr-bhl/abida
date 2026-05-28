import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';

const parser = new Parser();
const TASKS_PATH = path.join(process.cwd(), 'src/lib/tasks.json');
const BENCHMARKS_PATH = path.join(process.cwd(), 'src/lib/benchmarks.json');

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/news.rss' }
];

function loadData<T>(filePath: string): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
  }
  return [];
}

function saveData(filePath: string, data: unknown): void {
  try {
    // In production/serverless environments like Vercel, the filesystem may be read-only.
    // For this demonstration, we attempt to write but log a specific warning if it fails.
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.warn(`Could not save to ${filePath}. In serverless environments, use a database for persistence.`, error);
  }
}

export async function runBenchmark() {
  const tasks = loadData<Task>(TASKS_PATH);
  const benchmarks = loadData<BenchmarkRecord>(BENCHMARKS_PATH);
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);
      const lastBenchmark = benchmarks.find(b => b.competitor === competitor.name);
      const lastDate = lastBenchmark ? new Date(lastBenchmark.lastChecked) : new Date(0);

      let newArticlesCount = 0;

      for (const item of feed.items) {
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        if (pubDate > lastDate) {
          const taskId = crypto.randomUUID();
          newTasks.push({
            id: taskId,
            title: `Review: ${item.title}`,
            description: `Competitor ${competitor.name} published a new article: ${item.link}. Analyze and respond.`,
            status: 'pending',
            priority: 'medium',
            sourceUrl: item.link || '',
            competitor: competitor.name,
            createdAt: new Date().toISOString()
          });
          newArticlesCount++;
        }
      }

      // Update benchmark record
      const benchmarkIndex = benchmarks.findIndex(b => b.competitor === competitor.name);
      const record: BenchmarkRecord = {
        id: crypto.randomUUID(),
        competitor: competitor.name,
        lastChecked: new Date().toISOString(),
        newArticlesFound: newArticlesCount
      };

      if (benchmarkIndex >= 0) {
        benchmarks[benchmarkIndex] = record;
      } else {
        benchmarks.push(record);
      }
    } catch (error) {
      console.error(`Failed to benchmark ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    saveData(TASKS_PATH, [...tasks, ...newTasks]);
  }
  saveData(BENCHMARKS_PATH, benchmarks);

  return { tasksCreated: newTasks.length };
}
