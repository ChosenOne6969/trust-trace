"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
// Import the dynamic API URL we configured earlier
import { API_URL } from '@/utils/api'; 

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const fetchRankData = async () => {
      const token = localStorage.getItem('token');
      // Only attempt fetch if a token exists to avoid 401 errors on initial load
      if (token) {
        try {
          // Changed hardcoded localhost to the dynamic API_URL
          const res = await axios.get(`${API_URL}/api/reports/my-traces`, {
            headers: { 'x-auth-token': token }
          });
          // Added a null-check to ensure res.data exists before checking length
          setReportCount(res.data && Array.isArray(res.data) ? res.data.length : 0);
        } catch (err) { 
          console.error("Rank fetch failed: Check backend route /api/reports/my-traces"); 
        }
      }
    };
    
    fetchRankData();
    return () => observer.disconnect();
  }, []);

  const getRankInfo = () => {
    if (reportCount >= 20) return { title: 'Titan Guardian', color: 'bg-rose-600', glow: 'shadow-[0_0_15px_rgba(225,29,72,0.5)]' };
    if (reportCount >= 10) return { title: 'Silver Guardian', color: 'bg-slate-400', glow: 'shadow-[0_0_15px_rgba(148,163,184,0.5)]' };
    if (reportCount >= 5) return { title: 'Lead Guardian', color: 'bg-blue-600', glow: 'shadow-[0_0_15px_rgba(37,99,235,0.5)]' };
    return { title: 'Novice Guardian', color: 'bg-green-600', glow: 'shadow-[0_0_15px_rgba(22,163,74,0.5)]' };
  };

  const rank = getRankInfo();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  };

  const linkStyle = "text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-blue-600 hover:-translate-y-0.5 active:scale-95 px-2 py-1 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50";
  const dynamicTextColor = { color: isDark ? '#ffffff' : '#0f172a' };

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex items-center justify-between backdrop-blur-xl bg-white/40 dark:bg-slate-950/40 border-b border-white/10">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-1 group transition-transform hover:scale-105">
          <span className="text-2xl font-black tracking-tighter transition-colors" style={dynamicTextColor}>TT</span>
          <span className="w-2 h-2 bg-blue-600 rounded-full group-hover:animate-pulse transition-all"></span>
        </Link>

        <div className={`px-4 py-1.5 rounded-full ${rank.color} ${rank.glow} transition-all duration-500 hover:scale-110 cursor-default hidden lg:block`}>
          <p className="text-[8px] font-black text-white uppercase tracking-[0.2em]">{rank.title}</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className={linkStyle} style={dynamicTextColor}>Search</Link>
        <Link href="/report" className={linkStyle} style={dynamicTextColor}>Report</Link>
        <Link href="/dashboard" className={linkStyle} style={dynamicTextColor}>Traces</Link>
        <Link href="/profile" className={linkStyle} style={dynamicTextColor}>Profile</Link>
      </div>

      <div className="flex items-center gap-6">
        <button onClick={toggleTheme} className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center shadow-xl hover:scale-110 transition-all border border-white/20">
          {isDark ? <span className="text-amber-400 text-lg">☀️</span> : <span className="text-blue-400 text-lg">🌙</span>}
        </button>
        <button onClick={handleLogout} className="px-8 py-3 rounded-2xl bg-[#FF2D55] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all">
          Logout
        </button>
      </div>
    </nav>
  );
};