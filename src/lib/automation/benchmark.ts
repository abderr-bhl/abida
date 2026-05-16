import Parser from 'rss-parser';

const parser = new Parser();

export interface BenchmarkResult {
  source: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
}

export async function fetchCompetitorFeeds(): Promise<BenchmarkResult[]> {
  const feeds = [
    { name: "Tom's Guide", url: 'https://www.tomsguide.com/feeds.xml' },
    { name: "RTINGS", url: 'https://www.rtings.com/latest-rss.xml' },
  ];

  const allResults: BenchmarkResult[] = [];

  for (const feed of feeds) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      const items = parsedFeed.items.slice(0, 5).map(item => ({
        source: feed.name,
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        contentSnippet: item.contentSnippet || '',
      }));
      allResults.push(...items);
    } catch (error) {
      console.error(`Error fetching feed from ${feed.name}:`, error);
    }
  }

  return allResults.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
