import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { BenchmarkRecord, Task } from '../../types';

const parser = new Parser();

const DATA_DIR = path.join(process.cwd(), 'data');
const BENCHMARKS_FILE = path.join(DATA_DIR, 'benchmarks.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const SOURCES = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/news.rss' }
];

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [];
  }
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    // Handle EROFS (Read-only file system) which is common in serverless
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn(`Warning: Could not save to ${filePath} due to read-only filesystem.`);
    } else {
      console.error(`Error saving data to ${filePath}:`, error);
    }
  }
}

export async function runBenchmark() {
  console.log('Starting benchmark process...');

  const existingBenchmarks = await loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const existingTasks = await loadData<Task>(TASKS_FILE);

  const newBenchmarks: BenchmarkRecord[] = [...existingBenchmarks];
  const newTasks: Task[] = [...existingTasks];

  let addedCount = 0;

  for (const source of SOURCES) {
    try {
      console.log(`Fetching feed from ${source.name}...`);
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items) {
        const isAlreadyProcessed = existingBenchmarks.some(b => b.url === item.link);

        if (!isAlreadyProcessed && item.link && item.title) {
          const benchmarkRecord: BenchmarkRecord = {
            id: crypto.randomUUID(),
            source: source.name,
            title: item.title,
            url: item.link,
            publishedDate: item.pubDate || new Date().toISOString(),
            processedAt: new Date().toISOString()
          };

          newBenchmarks.push(benchmarkRecord);

          // Determine task type based on title or source
          let type: Task['type'] = 'news';
          if (item.title.toLowerCase().includes('review')) type = 'review';
          else if (item.title.toLowerCase().includes('guide')) type = 'guide';
          else if (item.title.toLowerCase().includes('vs')) type = 'comparison';

          const task: Task = {
            id: crypto.randomUUID(),
            title: `Analyze competitor: ${item.title}`,
            description: `A new article was published on ${source.name}. Evaluate if we need to update our content or create a new response.`,
            sourceUrl: item.link,
            status: 'pending',
            priority: source.name === 'Wirecutter' ? 'high' : 'medium',
            createdAt: new Date().toISOString(),
            type
          };

          newTasks.push(task);
          addedCount++;
        }
      }
    } catch (error) {
      console.error(`Error processing feed for ${source.name}:`, error);
    }
  }

  if (addedCount > 0) {
    await saveData(BENCHMARKS_FILE, newBenchmarks);
    await saveData(TASKS_FILE, newTasks);
    console.log(`Benchmark complete. Added ${addedCount} new tasks.`);
  } else {
    console.log('Benchmark complete. No new items found.');
  }

  return { addedCount };
}
