import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');
const BENCHMARKS_FILE = path.join(process.cwd(), 'src/lib/benchmarks.json');

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/news.rss' }
];

export async function runBenchmark() {
  const tasks: Task[] = loadData(TASKS_FILE);
  const benchmarks: BenchmarkRecord[] = loadData(BENCHMARKS_FILE);

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        const existingTask = tasks.find(t => t.sourceUrl === item.link);

        if (!existingTask) {
          const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'GAP_ANALYSIS',
            title: `Analyze: ${item.title}`,
            description: `Competitor ${competitor.name} published: ${item.title}. Evaluate if we need a similar review or guide.`,
            priority: 'MEDIUM',
            status: 'PENDING',
            sourceUrl: item.link,
            createdAt: new Date().toISOString()
          };
          tasks.push(newTask);
        }
      }

      const recordIndex = benchmarks.findIndex(b => b.competitor === competitor.name);
      const record: BenchmarkRecord = {
        id: recordIndex >= 0 ? benchmarks[recordIndex].id : Math.random().toString(36).substr(2, 9),
        competitor: competitor.name,
        lastChecked: new Date().toISOString(),
        status: 'SUCCESS'
      };

      if (recordIndex >= 0) {
        benchmarks[recordIndex] = record;
      } else {
        benchmarks.push(record);
      }

    } catch (error) {
      console.error(`Error benchmarking ${competitor.name}:`, error);
    }
  }

  saveData(TASKS_FILE, tasks);
  saveData(BENCHMARKS_FILE, benchmarks);
}

function loadData(filePath: string) {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return [];
}

function saveData(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
