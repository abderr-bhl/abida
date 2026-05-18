import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';

const parser = new Parser();
const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');

interface Task {
  id: string;
  title: string;
  source: string;
  url: string;
  status: 'pending' | 'completed';
  date: string;
}

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  // Add more competitors here
];

export async function runBenchmark() {
  const allTasks: Task[] = fs.existsSync(TASKS_FILE)
    ? JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'))
    : [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        const exists = allTasks.find(t => t.url === item.link);

        if (!exists) {
          allTasks.push({
            id: Math.random().toString(36).substring(7),
            title: item.title || 'Untitled Article',
            source: competitor.name,
            url: item.link || '',
            status: 'pending',
            date: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch RSS for ${competitor.name}:`, error);
    }
  }

  // Keep only latest 50 tasks for demo
  const limitedTasks = allTasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50);

  fs.writeFileSync(TASKS_FILE, JSON.stringify(limitedTasks, null, 2));
  return limitedTasks;
}
