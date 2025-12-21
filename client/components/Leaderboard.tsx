"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

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
        const res = await axios.get('http://localhost:5000/api/auth/leaderboard');
        if (Array.isArray(res.data)) setTopUsers(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchLeaderboard();
    return () => observer.disconnect();
  }, []);

  if (loading) return <div className="p-10 animate-pulse bg-white/20 rounded-3xl h-64"></div>;

  return (
    <div className="glass-card p-8 rounded-[2.5rem] shadow-xl w-full transition-all duration-500">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-8 ml-2">
        Guardians
      </h3>
      
      <div className="space-y-6">
        {topUsers.map((user, index) => (
          <div key={index} className="flex items-center justify-between group cursor-pointer transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400">0{index + 1}</span>
              <div className="w-10 h-10 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl flex items-center justify-center text-xs font-bold shadow-lg">
                {user.name?.substring(0, 1) || 'U'}
              </div>

              <div>
                {/* DYNAMIC INLINE COLOR */}
                <p 
                  className="text-sm font-bold transition-colors duration-300"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  {user.name || 'Anonymous'}
                </p>
                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  LEVEL {index + 1} CONTRIBUTOR
                </p>
              </div>
            </div>
            
            <div className="text-right">
               <p className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                 {user.reportCount}
               </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};