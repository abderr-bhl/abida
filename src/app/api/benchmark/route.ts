import { NextResponse } from 'next/server';
import { fetchCompetitorFeeds } from '@/lib/automation/benchmark';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const results = await fetchCompetitorFeeds();

    // NOTE: In production (e.g. Vercel), use a database. Filesystem is often read-only.
    try {
      const filePath = path.join(process.cwd(), 'src/lib/benchmarks.json');
      fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    } catch (err) {
      console.warn('Persistence to filesystem failed (likely serverless environment):', err);
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      timestamp: new Date().toISOString(),
      data: results // Return data directly for the dashboard
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
