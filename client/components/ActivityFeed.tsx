"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ActivityFeed() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Sync with the theme on mount and whenever it changes
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const fetchFeed = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/reports/recent/feed');
        setFeed(res.data);
      } catch (err) {
        console.error("Feed error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
    return () => observer.disconnect();
  }, []);

  if (loading) return <div className="p-10 animate-pulse bg-white/20 rounded-3xl h-64"></div>;

  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-4">
        Recent Collective Traces
      </h3>
      
      <div className="space-y-4">
        {feed.map((trace) => (
          <div 
            key={trace._id} 
            className="glass-card group p-6 rounded-[2.5rem] flex items-center justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              {/* DYNAMIC INLINE COLOR: Dark Navy in Light Mode, White in Dark Mode */}
              <span 
                className="text-sm font-bold transition-colors duration-300"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                {trace.websiteUrl}
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {trace.productName || "General Trace"}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[9px] text-slate-400">
                  {new Date(trace.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md ${
                trace.outcome === 'delivered' ? 'bg-green-500 text-white' : 
                trace.outcome === 'not_delivered' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {trace.outcome.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};