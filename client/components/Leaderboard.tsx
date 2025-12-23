"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
// Import your dynamic API URL utility
import { API_URL } from '@/utils/api'; 

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const fetchLeaderboard = async () => {
      try {
        // FIXED: Replaced localhost with dynamic API_URL
        const res = await axios.get(`${API_URL}/api/auth/leaderboard`);
        if (Array.isArray(res.data)) {
          setTopUsers(res.data);
        }
      } catch (err) { 
        console.error("Leaderboard fetch failed:", err); 
        setTopUsers([]);
      } finally { 
        setLoading(false); 
      }
    };
    fetchLeaderboard();
    return () => observer.disconnect();
  }, []);

  if (loading) return (
    <div className="p-8 glass-card rounded-[2.5rem] animate-pulse bg-white/10 h-64 border border-white/5">
       <div className="h-2 w-20 bg-slate-400/20 rounded mb-8"></div>
       <div className="space-y-4">
          <div className="h-10 bg-slate-400/10 rounded-2xl w-full"></div>
          <div className="h-10 bg-slate-400/10 rounded-2xl w-full opacity-50"></div>
       </div>
    </div>
  );

  return (
    <div className="glass-card p-8 rounded-[2.5rem] shadow-xl w-full transition-all duration-500 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/10">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-8 ml-2">
        Guardians
      </h3>
      
      <div className="space-y-6">
        {topUsers.length > 0 ? (
          topUsers.map((user, index) => (
            <div key={index} className="flex items-center justify-between group cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400">0{index + 1}</span>
                <div className="w-10 h-10 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xs font-black shadow-lg">
                  {user.name?.substring(0, 1).toUpperCase() || 'U'}
                </div>

                <div>
                  <p 
                    className="text-sm font-bold transition-colors duration-300"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    {user.name || 'Anonymous Guardian'}
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {user.reportCount >= 10 ? 'Elite Contributor' : 'Active Contributor'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                 <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                   {user.reportCount}
                 </p>
              </div>
            </div>
          ))
        ) : (
          /* FALLBACK STATE FOR NEW DEPLOYMENTS */
          <div className="py-4 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
               Recruiting Guardians...
             </p>
          </div>
        )}
      </div>
    </div>
  );
};