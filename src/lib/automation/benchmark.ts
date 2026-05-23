import Parser from 'rss-parser';
import { Task, BenchmarkRecord, Guide } from '../../types';
import fs from 'fs/promises';
import path from 'path';
import { guides as existingGuides } from '../mockData';

const parser = new Parser();
const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/svc/collections/v1/publish/www.nytimes.com/wirecutter/rss' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/reviews.rss' }
];

const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');
const BENCHMARK_FILE = path.join(process.cwd(), 'src/lib/benchmarks.json');

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (_error) {
    return [];
  }
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function checkContentGap(title: string, guides: Guide[]): boolean {
  const normalizedTitle = title.toLowerCase();
  // Simple heuristic: if most words in competitor title aren't in any of our guide titles
  // For demo, we just check if the title is already covered in our mock data
  return !guides.some(guide => normalizedTitle.includes(guide.category.toLowerCase()) || normalizedTitle.includes(guide.title.toLowerCase().split(' ')[0]));
}

export async function runBenchmarking() {
  const tasks = await loadData<Task>(TASKS_FILE);
  const benchmarks = await loadData<BenchmarkRecord>(BENCHMARK_FILE);
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);

      // Check top 5 items for gaps
      for (const item of feed.items.slice(0, 5)) {
        if (!item.title || !item.link) continue;

        const isGap = checkContentGap(item.title, existingGuides);
        const alreadyTasked = tasks.some(t => t.competitorUrl === item.link);

        if (isGap && !alreadyTasked) {
          const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'CONTENT_GAP',
            title: `New Topic: ${item.title}`,
            description: `Competitor ${competitor.name} published a new guide. We should consider covering this.`,
            competitorUrl: item.link,
            status: 'PENDING',
            priority: 'MEDIUM',
            createdAt: new Date().toISOString()
          };
          newTasks.push(newTask);
          tasks.push(newTask);
        }
      }

      const latestItem = feed.items[0];
      if (latestItem) {
        const updatedRecord: BenchmarkRecord = {
          competitor: competitor.name,
          lastChecked: new Date().toISOString(),
          latestArticleTitle: latestItem.title || ''
        };

        const index = benchmarks.findIndex(b => b.competitor === competitor.name);
        if (index > -1) {
          benchmarks[index] = updatedRecord;
        } else {
          benchmarks.push(updatedRecord);
        }
      }
    } catch (error) {
      console.error(`Error fetching feed for ${competitor.name}:`, error);
    }
  }

  await saveData(TASKS_FILE, tasks);
  await saveData(BENCHMARK_FILE, benchmarks);

  return { newTasksCount: newTasks.length };
}
