"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
// Import your dynamic API URL utility
import { API_URL } from '@/utils/api'; 

export default function ActivityFeed() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const fetchFeed = async () => {
      try {
        // FIXED: Changed localhost to the dynamic API_URL
        const res = await axios.get(`${API_URL}/api/reports/recent/feed`);
        // FIXED: Ensure we handle empty responses gracefully
        setFeed(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Feed connection error:", err);
        setFeed([]); // Clear feed on error to prevent mapping undefined
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
    return () => observer.disconnect();
  }, []);

  if (loading) return (
    <div className="space-y-4">
       <div className="p-10 animate-pulse bg-slate-100 dark:bg-slate-800/40 rounded-[2.5rem] h-32"></div>
       <div className="p-10 animate-pulse bg-slate-100 dark:bg-slate-800/40 rounded-[2.5rem] h-32 opacity-50"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-4">
        Recent Collective Traces
      </h3>
      
      <div className="space-y-4">
        {feed.length > 0 ? (
          feed.map((trace) => (
            <div 
              key={trace._id} 
              className="glass-card group p-6 rounded-[2.5rem] flex items-center justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50"
            >
              <div className="flex flex-col gap-1">
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
                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md transition-all ${
                  trace.outcome === 'delivered' ? 'bg-green-500 text-white' : 
                  trace.outcome === 'not_delivered' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {trace.outcome.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))
        ) : (
          /* EMPTY STATE */
          <div className="p-12 text-center rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
             <p className="text-slate-400 text-xs font-medium italic">Collective memory is currently clear. No traces recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};