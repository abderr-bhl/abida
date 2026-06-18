import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const HISTORY_FILE = path.join(DATA_DIR, 'benchmark_history.json');

const COMPETITORS = [
  { name: 'Wirecutter' as const, feed: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS' as const, feed: 'https://www.rtings.com/rss/reviews.xml' }
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadData<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function saveData(filePath: string, data: unknown) {
  ensureDataDir();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.error('Filesystem is read-only. Data not saved.');
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  console.log('Starting benchmark...');
  const tasks = loadData<Task>(TASKS_FILE);
  const history = loadData<BenchmarkRecord>(HISTORY_FILE);
  const newTasks: Task[] = [];
  const newHistory: BenchmarkRecord[] = [];

  for (const comp of COMPETITORS) {
    try {
      const feed = await parser.parseURL(comp.feed);
      for (const item of feed.items) {
        const isAlreadyScanned = history.some(h => h.url === item.link);
        if (!isAlreadyScanned && item.link) {
          const id = crypto.randomUUID();

          const record: BenchmarkRecord = {
            id,
            url: item.link,
            title: item.title || 'No Title',
            competitor: comp.name,
            publishedAt: item.pubDate || new Date().toISOString(),
            scannedAt: new Date().toISOString()
          };
          newHistory.push(record);

          const task: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title}`,
            description: `Nouveau contenu détecté chez ${comp.name}. Evaluer si nous devons produire un contenu similaire pour le marché USA. Source: ${item.link}`,
            status: 'pending',
            priority: 'medium',
            category: item.link.includes('review') ? 'review' : 'guide',
            competitor: comp.name,
            sourceUrl: item.link,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          newTasks.push(task);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch feed for ${comp.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    saveData(TASKS_FILE, [...tasks, ...newTasks]);
    saveData(HISTORY_FILE, [...history, ...newHistory]);
    console.log(`Added ${newTasks.length} new tasks.`);
  } else {
    console.log('No new content found.');
  }

  return newTasks;
}
