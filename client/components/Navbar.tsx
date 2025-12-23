"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/utils/api'; 

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false); // NEW: Track mobile menu state
  const router = useRouter();

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const fetchRankData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/api/reports/my-traces`, {
            headers: { 'x-auth-token': token }
          });
          setReportCount(res.data && Array.isArray(res.data) ? res.data.length : 0);
        } catch (err) { console.error("Rank fetch failed"); }
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

  const linkStyle = "text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-blue-600 px-4 py-2 rounded-lg";
  const dynamicTextColor = { color: isDark ? '#ffffff' : '#0f172a' };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-white/40 dark:bg-slate-950/40 border-b border-white/10">
        <div className="flex items-center gap-4">
          {/* MOBILE MENU BUTTON */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-900 dark:text-white"
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-2xl font-black tracking-tighter" style={dynamicTextColor}>TT</span>
            <span className="w-2 h-2 bg-blue-600 rounded-full group-hover:animate-pulse"></span>
          </Link>

          {/* RANK BADGE (Hidden on very small screens) */}
          <div className={`px-4 py-1.5 rounded-full ${rank.color} ${rank.glow} hidden sm:block`}>
            <p className="text-[8px] font-black text-white uppercase tracking-[0.2em]">{rank.title}</p>
          </div>
        </div>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={linkStyle} style={dynamicTextColor}>Search</Link>
          <Link href="/report" className={linkStyle} style={dynamicTextColor}>Report</Link>
          <Link href="/dashboard" className={linkStyle} style={dynamicTextColor}>Traces</Link>
          <Link href="/profile" className={linkStyle} style={dynamicTextColor}>Profile</Link>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center shadow-xl">
            {isDark ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout} className="hidden sm:block px-6 py-2.5 rounded-2xl bg-[#FF2D55] text-white text-[10px] font-black uppercase tracking-[0.2em]">
            Logout
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-[90] bg-white dark:bg-slate-950 p-10 pt-32 flex flex-col gap-8 animate-in fade-in slide-in-from-top-5 md:hidden">
          <Link onClick={() => setMenuOpen(false)} href="/" className="text-2xl font-bold" style={dynamicTextColor}>Search</Link>
          <Link onClick={() => setMenuOpen(false)} href="/report" className="text-2xl font-bold" style={dynamicTextColor}>Report</Link>
          <Link onClick={() => setMenuOpen(false)} href="/dashboard" className="text-2xl font-bold" style={dynamicTextColor}>Traces</Link>
          <Link onClick={() => setMenuOpen(false)} href="/profile" className="text-2xl font-bold" style={dynamicTextColor}>Profile</Link>
          <hr className="border-slate-200 dark:border-slate-800" />
          <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-[#FF2D55] text-white font-black uppercase tracking-widest">
            Logout
          </button>
        </div>
      )}
    </>
  );
};