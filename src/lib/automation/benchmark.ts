import Parser from 'rss-parser';
import { Task, BenchmarkRecord } from '../../types';
import fs from 'fs/promises';
import path from 'path';

const parser = new Parser();
const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/news.rss' }
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARKS_FILE = path.join(DATA_DIR, 'benchmarks.json');

async function ensureFile(filepath: string, initialData: unknown) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(filepath);
  } catch {
    try {
      await fs.writeFile(filepath, JSON.stringify(initialData, null, 2));
    } catch (err) {
      console.warn(`Could not write initial data to ${filepath}:`, err);
    }
  }
}

export async function runBenchmark() {
  await ensureFile(TASKS_FILE, []);
  await ensureFile(BENCHMARKS_FILE, []);

  const tasksData = await fs.readFile(TASKS_FILE, 'utf-8');

  const existingTasks: Task[] = JSON.parse(tasksData);

  const newTasks: Task[] = [];
  const benchmarkResults: BenchmarkRecord[] = [];

  for (const comp of COMPETITORS) {
    try {
      const feed = await parser.parseURL(comp.rss);
      let newArticlesCount = 0;

      for (const item of feed.items) {
        const alreadyExists = existingTasks.some(t => t.competitorUrl === item.link);

        if (!alreadyExists) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `New Competitor Article: ${item.title}`,
            description: `Review and respond to: ${item.contentSnippet || item.title}`,
            status: 'pending',
            priority: 'medium',
            competitorUrl: item.link || '',
            createdAt: new Date().toISOString(),
            category: 'Competitor Analysis'
          };
          newTasks.push(newTask);
          newArticlesCount++;
        }
      }

      benchmarkResults.push({
        id: crypto.randomUUID(),
        competitor: comp.name,
        lastChecked: new Date().toISOString(),
        newArticlesFound: newArticlesCount
      });

    } catch (error) {
      console.error(`Error parsing ${comp.name} RSS:`, error);
    }
  }

  if (newTasks.length > 0) {
    try {
      await fs.writeFile(TASKS_FILE, JSON.stringify([...newTasks, ...existingTasks], null, 2));
    } catch (err) {
      console.error(`Failed to save tasks:`, err);
    }
  }

  try {
    await fs.writeFile(BENCHMARKS_FILE, JSON.stringify(benchmarkResults, null, 2));
  } catch (err) {
    console.error(`Failed to save benchmark records:`, err);
  }

  return { tasksAdded: newTasks.length, benchmarkResults };
}
