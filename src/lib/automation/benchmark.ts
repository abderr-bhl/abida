import Parser from 'rss-parser';
import * as fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmarks.json');

const SOURCES = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
  }
}

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveData<T>(filePath: string, data: T[]) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Failed to save data to ${filePath}:`, error);
  }
}

export async function runBenchmark() {
  await ensureDataDir();

  const existingTasks = await loadData<Task>(TASKS_FILE);
  const existingBenchmarks = await loadData<BenchmarkRecord>(BENCHMARK_FILE);
  const newTasks: Task[] = [];
  const benchmarkRecords: BenchmarkRecord[] = [];

  for (const source of SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      let count = 0;

      for (const item of feed.items) {
        const sourceUrl = item.link || '';
        const alreadyExists = existingTasks.some(t => t.sourceUrl === sourceUrl) ||
                             newTasks.some(t => t.sourceUrl === sourceUrl);

        if (!alreadyExists && sourceUrl) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title}`,
            description: `Nouvel article détecté sur ${source.name}. Évaluer le potentiel pour ReviewGuid.`,
            status: 'pending',
            sourceUrl,
            competitor: source.name,
            createdAt: new Date().toISOString()
          };
          newTasks.push(newTask);
          count++;
        }
      }

      benchmarkRecords.push({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        source: source.name,
        articleCount: count
      });
    } catch (error) {
      console.error(`Error fetching feed from ${source.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveData(TASKS_FILE, [...newTasks, ...existingTasks]);
  }
  await saveData(BENCHMARK_FILE, [...benchmarkRecords, ...existingBenchmarks]);

  return {
    tasksCreated: newTasks.length,
    benchmarks: benchmarkRecords
  };
}
