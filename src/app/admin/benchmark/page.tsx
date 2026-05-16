'use client';

import { useState, useEffect } from 'react';
import { BenchmarkResult } from '@/lib/automation/benchmark';

export default function BenchmarkDashboard() {
  const [data, setData] = useState<BenchmarkResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const res = await fetch('/api/benchmark');
        const json = await res.json();
        if (isMounted && json.success) {
          setData(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/benchmark');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Market Intelligence</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Daily automated competitor benchmarking task</p>
          </div>
          <button
            disabled={refreshing}
            onClick={handleManualRefresh}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {refreshing ? 'Processing Task...' : 'Run Automated Task'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Monitors</span>
                <div className="text-3xl font-black mt-2 text-primary dark:text-blue-500">3</div>
                <div className="text-xs text-green-600 font-bold mt-1 uppercase tracking-tight">Wirecutter, RTINGS, Tom&apos;s Guide</div>
            </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Task Frequency</span>
                <div className="text-3xl font-black mt-2 text-primary dark:text-blue-500">Daily</div>
                <div className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-tight">Fully automated cron job</div>
            </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Market Coverage</span>
                <div className="text-3xl font-black mt-2 text-primary dark:text-blue-500">100%</div>
                <div className="text-xs text-orange-600 font-bold mt-1 uppercase tracking-tight">US Tech & Home Categories</div>
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold">Latest Competitor Activities</h2>
            <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase">Real-time Feed</span>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800">
             {loading ? (
                <div className="p-20 text-center">
                   <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                   <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Fetching latest market data...</p>
                </div>
             ) : data.length > 0 ? (
                data.map((item, i) => (
                  <div key={i} className="p-6 hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50 group">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-black bg-primary text-white px-2 py-0.5 rounded uppercase tracking-tighter">{item.source}</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(item.pubDate).toLocaleString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                       <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 dark:text-gray-400 leading-relaxed">{item.contentSnippet}</p>
                    <div className="mt-4 flex gap-4">
                        <button className="text-[10px] font-black uppercase text-primary hover:underline">Compare Our Version</button>
                        <button className="text-[10px] font-black uppercase text-accent hover:underline">Identify Gaps</button>
                    </div>
                  </div>
                ))
             ) : (
                <div className="p-20 text-center text-gray-500">
                  <p className="font-bold uppercase tracking-widest">No benchmark data available.</p>
                  <p className="text-sm mt-1">Run the automated task to populate this dashboard.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
