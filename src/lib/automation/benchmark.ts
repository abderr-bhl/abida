import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/reviews.rss' }
];

async function loadData<T>(filePath: string): Promise<T[]> {
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

async function saveData<T>(filePath: string, data: T[]): Promise<void> {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
     const err = error as NodeJS.ErrnoException;
     if (err.code === 'EROFS') {
       console.warn('Filesystem is read-only. Data not saved.');
     } else {
       console.error(`Error writing ${filePath}:`, error);
     }
  }
}

export async function runBenchmark() {
  const tasks = await loadData<Task>(TASKS_FILE);
  const records = await loadData<BenchmarkRecord>(BENCHMARK_FILE);
  let newTasksCount = 0;

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);
      for (const item of feed.items) {
        const alreadyTracked = records.find(r => r.articleUrl === item.link);
        if (!alreadyTracked && item.link && item.title) {
          const record: BenchmarkRecord = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            competitor: competitor.name,
            articleTitle: item.title,
            articleUrl: item.link
          };
          records.push(record);

          const task: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title}`,
            description: `Nouvel article détecté chez ${competitor.name}. Évaluer le potentiel de contenu pour reviewguid.com.`,
            status: 'todo',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            sourceUrl: item.link,
            competitor: competitor.name
          };
          tasks.push(task);
          newTasksCount++;
        }
      }
    } catch (error) {
      console.error(`Failed to fetch RSS for ${competitor.name}:`, error);
    }
  }

  if (newTasksCount > 0) {
    await saveData(TASKS_FILE, tasks);
    await saveData(BENCHMARK_FILE, records);
  }

  return { newTasksCount };
}
