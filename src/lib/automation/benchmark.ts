import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();

/**
 * NOTE ON PERSISTENCE:
 * This implementation uses local JSON files for demonstration.
 * In a serverless environment (like Vercel), the filesystem is read-only or ephemeral.
 * FOR PRODUCTION: Replace this logic with a database (e.g., PostgreSQL, MongoDB, or Supabase).
 */
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const HISTORY_FILE = path.join(DATA_DIR, 'benchmark_history.json');

const COMPETITORS = [
  { name: 'Wirecutter', feed: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', feed: 'https://www.rtings.com/rss/reviews.xml' },
];

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function loadData<T>(file: string): Promise<T[]> {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveData(file: string, data: unknown) {
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Warning: Read-only filesystem, could not save data to', file);
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  await ensureDataDir();
  const history = await loadData<BenchmarkRecord>(HISTORY_FILE);
  const tasks = await loadData<Task>(TASKS_FILE);

  const newTasks: Task[] = [];
  const newHistory: BenchmarkRecord[] = [...history];

  for (const comp of COMPETITORS) {
    try {
      const feed = await parser.parseURL(comp.feed);
      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        const alreadyProcessed = history.some(h => h.link === item.link);
        if (!alreadyProcessed) {
          const taskId = crypto.randomUUID();
          const newTask: Task = {
            id: taskId,
            title: `Analyser : ${item.title}`,
            description: `Nouveau contenu détecté sur ${comp.name}. Analyser la stratégie et le contenu.`,
            status: 'pending',
            type: 'benchmark',
            sourceUrl: item.link,
            createdAt: new Date().toISOString(),
          };

          newTasks.push(newTask);
          newHistory.push({
            id: crypto.randomUUID(),
            site: comp.name,
            title: item.title,
            link: item.link,
            pubDate: item.pubDate || new Date().toISOString(),
            processedAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error(`Failed to fetch feed for ${comp.name}:`, err);
    }
  }

  if (newTasks.length > 0) {
    await saveData(TASKS_FILE, [...newTasks, ...tasks]);
    await saveData(HISTORY_FILE, newHistory);
  }

  return newTasks;
}
