import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const COMPETITORS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');
const BENCHMARKS_FILE = path.join(process.cwd(), 'src/lib/benchmarks.json');

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return [];
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

export async function runBenchmarking() {
  const existingTasks = await loadData<Task>(TASKS_FILE);
  await loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const newTasks: Task[] = [...existingTasks];
  const benchmarkRecords: BenchmarkRecord[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.url);
      let newArticlesCount = 0;

      for (const item of feed.items) {
        const alreadyTasked = existingTasks.some(t => t.sourceUrl === item.link);
        if (!alreadyTasked) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyze: ${item.title}`,
            description: `Competitor ${competitor.name} published a new article: ${item.title}. Evaluate if we need a response or similar content.`,
            sourceUrl: item.link || '',
            competitor: competitor.name,
            status: 'pending',
            priority: 'medium',
            createdAt: new Date().toISOString()
          };
          newTasks.push(newTask);
          newArticlesCount++;
        }
      }

      benchmarkRecords.push({
        id: crypto.randomUUID(),
        competitor: competitor.name,
        lastChecked: new Date().toISOString(),
        newArticlesFound: newArticlesCount
      });
    } catch (error) {
      console.error(`Failed to fetch feed for ${competitor.name}:`, error);
    }
  }

  await saveData(TASKS_FILE, newTasks);
  await saveData(BENCHMARKS_FILE, benchmarkRecords);

  return { tasksCreated: newTasks.length - existingTasks.length, records: benchmarkRecords };
}
