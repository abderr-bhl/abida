import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';

const parser = new Parser();
const COMPETITORS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/svc/collections/v1/publish/www.nytimes.com/section/wirecutter/rss.xml' },
  { name: 'CNET', url: 'https://www.cnet.com/rss/news/' }
];

export interface Task {
  id: string;
  type: 'REVIEW' | 'GUIDE' | 'COMPARISON';
  title: string;
  source: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
}

export async function runBenchmark() {
  const results = [];
  const tasks: Task[] = [];

  for (const comp of COMPETITORS) {
    try {
      const feed = await parser.parseURL(comp.url);
      const latestArticles = feed.items.slice(0, 5).map(item => ({
        title: item.title || 'Untitled',
        link: item.link || '',
        pubDate: item.pubDate
      }));

      results.push({
        competitor: comp.name,
        lastUpdated: new Date().toISOString(),
        latestArticles
      });

      // Simple task generation logic: Create a task for each new competitor article
      latestArticles.forEach((article, index) => {
        tasks.push({
          id: `task-${comp.name}-${Date.now()}-${index}`,
          type: article.title.toLowerCase().includes('guide') ? 'GUIDE' : 'REVIEW',
          title: `Analyze and respond to: ${article.title}`,
          source: comp.name,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        });
      });

    } catch (error) {
      console.error(`Failed to fetch ${comp.name}:`, error);
    }
  }

  // Attempt to save data locally for demo purposes
  // In production (Vercel), this will silently fail or be ignored on read-only FS
  try {
    const dataPath = path.join(process.cwd(), 'src/lib/benchmarks.json');
    const tasksPath = path.join(process.cwd(), 'src/lib/tasks.json');

    // Check if we can write (this is still not a database but better than crashing)
    fs.writeFileSync(dataPath, JSON.stringify(results, null, 2));
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.warn('Could not write to filesystem (expected in serverless production):', error);
  }

  return { results, tasks };
}
