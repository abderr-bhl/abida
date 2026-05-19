import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, Benchmark } from '../../types';

const parser = new Parser();

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/reviews.rss' }
];

const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');
const BENCHMARKS_FILE = path.join(process.cwd(), 'src/lib/benchmarks.json');

export async function runBenchmarking() {
  const tasks: Task[] = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8') || '[]');
  const benchmarks: Benchmark[] = JSON.parse(fs.readFileSync(BENCHMARKS_FILE, 'utf8') || '[]');

  const newTasks: Task[] = [];
  const updatedBenchmarks: Benchmark[] = [];

  for (const comp of COMPETITORS) {
    try {
      const feed = await parser.parseURL(comp.rss);
      const lastCheck = benchmarks.find(b => b.competitorName === comp.name)?.lastChecked;

      let newArticlesCount = 0;

      for (const item of feed.items) {
        const itemDate = item.pubDate ? new Date(item.pubDate) : new Date();
        if (!lastCheck || itemDate > new Date(lastCheck)) {
          newArticlesCount++;

          // Generate a task for the new article
          const task: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: `Analyze competitor article: ${item.title}`,
            description: `Competitor ${comp.name} published a new article: "${item.title}". Evaluate if we need to cover this or update our existing content.`,
            status: 'pending',
            priority: 'medium',
            type: 'review', // Default type, can be improved with logic
            competitorUrl: item.link,
            createdAt: new Date().toISOString()
          };
          newTasks.push(task);
        }
      }

      updatedBenchmarks.push({
        id: `bench-${Date.now()}-${comp.name.toLowerCase()}`,
        competitorName: comp.name,
        lastChecked: new Date().toISOString(),
        newArticlesFound: newArticlesCount
      });

    } catch (error) {
      console.error(`Error fetching RSS for ${comp.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([...tasks, ...newTasks], null, 2));
  }
  fs.writeFileSync(BENCHMARKS_FILE, JSON.stringify(updatedBenchmarks, null, 2));

  return { newTasksCount: newTasks.length };
}
