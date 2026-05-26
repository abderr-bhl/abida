import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/reviews.xml' }
];

const TASKS_PATH = path.join(process.cwd(), 'src/lib/tasks.json');
const BENCHMARKS_PATH = path.join(process.cwd(), 'src/lib/benchmarks.json');

function getData<T>(filePath: string): T {
  try {
    if (!fs.existsSync(filePath)) return [] as unknown as T;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [] as unknown as T;
  }
}

function saveData(filePath: string, data: unknown): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving to ${filePath}:`, error);
  }
}

export async function runBenchmark() {
  const tasks = getData<Task[]>(TASKS_PATH);
  const benchmarks = getData<BenchmarkRecord[]>(BENCHMARKS_PATH);
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);
      const lastRecord = benchmarks.find(b => b.competitor === competitor.name);

      let newArticlesCount = 0;
      const lastCheckedDate = lastRecord ? new Date(lastRecord.lastChecked) : new Date(0);

      for (const item of feed.items) {
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

        if (pubDate > lastCheckedDate) {
          newArticlesCount++;
          const taskId = crypto.randomUUID();

          newTasks.push({
            id: taskId,
            title: `Review competitor article: ${item.title}`,
            description: `Competitor ${competitor.name} published a new article: ${item.title}. Evaluate for content gap.`,
            sourceUrl: item.link || '',
            competitor: competitor.name,
            status: 'todo',
            priority: 'medium',
            createdAt: new Date().toISOString()
          });
        }
      }

      const updatedRecord: BenchmarkRecord = {
        id: lastRecord?.id || crypto.randomUUID(),
        competitor: competitor.name,
        lastChecked: new Date().toISOString(),
        newArticlesFound: newArticlesCount
      };

      const existingIndex = benchmarks.findIndex(b => b.competitor === competitor.name);
      if (existingIndex > -1) {
        benchmarks[existingIndex] = updatedRecord;
      } else {
        benchmarks.push(updatedRecord);
      }

    } catch (error) {
      console.error(`Failed to benchmark ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    saveData(TASKS_PATH, [...tasks, ...newTasks]);
  }
  saveData(BENCHMARKS_PATH, benchmarks);

  return {
    tasksCreated: newTasks.length,
    competitorsChecked: COMPETITORS.length
  };
}
