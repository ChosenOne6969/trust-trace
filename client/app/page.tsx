"use client";
import { useState, Suspense, useEffect } from 'react';
import axios from 'axios';
import ActivityFeed from '../components/ActivityFeed';
import Leaderboard from '../components/Leaderboard';
import { API_URL } from '@/utils/api'; // Ensure this utility is created

function HomeContent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!url) return;
    setLoading(true);
    setResult(null);

    // Clean the URL (remove https:// for the backend query if needed)
    const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

    try {
      const res = await axios.get(`${API_URL}/api/reports/snapshot/${encodeURIComponent(cleanUrl)}`);
      setResult(res.data);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setResult({ msg: 'New Entity', successRate: 0, reportVolume: 0 });
      } else {
        console.error("Verification failed", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12 items-start relative z-10">
      
      {/* MAIN SECTION */}
      <div className="lg:col-span-2 space-y-12">
        <header className="space-y-4">
          <h1 className="text-7xl font-extralight tracking-tighter leading-none">
            <span className="text-trust">Trust</span>
            <span className="text-trace font-bold">Trace</span>
          </h1>
          <div className="space-y-1">
            <p className="text-2xl font-light text-slate-500 italic">Awareness before accountability.</p>
            <p className="text-lg font-light text-slate-400 tracking-tight">A decentralised mirror of consumer experiences.</p>
          </div>
        </header>

        {/* SEARCH BOX */}
        <div className="space-y-6">
          <div className="relative group">
            <input
              type="text"
              placeholder="Verify a digital entity (URL)..."
              className="w-full p-7 pl-9 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-xl outline-none focus:ring-8 focus:ring-blue-500/10 text-slate-900 dark:text-white text-xl font-light"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button 
              onClick={handleVerify}
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 px-10 rounded-3xl bg-slate-900 dark:bg-blue-600 text-white font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Verify'}
            </button>
          </div>

          {/* ANALYSIS RESULT DISPLAY */}
          {result && (
            <div className="p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-blue-500/20 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500">Entity Snapshot</h3>
                <span className="text-[10px] font-black px-3 py-1 bg-blue-500/10 rounded-full text-blue-500 uppercase tracking-tighter">Live Audit</span>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Success Rate</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">{Math.round(result.successRate)}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Trace Volume</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">{result.reportVolume}</p>
                </div>
              </div>
              {result.reportVolume === 0 && (
                <p className="mt-4 text-xs text-amber-500 font-medium italic">Notice: This entity has no collective history. Proceed with caution.</p>
              )}
            </div>
          )}
        </div>

        <ActivityFeed />
      </div>

      {/* SIDEBAR SECTION */}
      <aside className="space-y-10 lg:sticky lg:top-12">
        <Leaderboard />
        
        <div className="philosophy-card p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden bg-slate-900 text-white">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-400 mb-8">OUR PHILOSOPHY</h4>
          <p className="text-sm font-light leading-relaxed">
            TrustTrace uses <span className="font-medium text-white">Collective Intelligence</span> to protect consumers. Ratings are 100% generated by verified user experiences.
          </p>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-5xl font-extralight tracking-tighter">2.4k</p>
            <p className="text-[10px] uppercase tracking-widest text-blue-400/60 mt-2">Scams Prevented</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 relative overflow-hidden">
      <div className="mesh-gradient fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-rose-100/20 dark:bg-rose-900/10 rounded-full blur-[140px]"></div>
      </div>
      
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Syncing Collective Memory...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
};