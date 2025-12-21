"use client";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export default function DashboardTraces() {
  const [allTraces, setAllTraces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const currencyMap: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: '$', AUD: '$'
  };

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
      document.body.style.backgroundColor = isDarkMode ? '#020617' : '#f8fafc';
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const fetchAllTraces = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/reports/recent/feed');
        setAllTraces(res.data);
      } catch (err) { console.error("Trace feed error:", err); } 
      finally { setLoading(false); }
    };
    fetchAllTraces();
    return () => {
      observer.disconnect();
      document.body.style.backgroundColor = ''; 
    };
  }, []);

  const InfoIcon = ({ text }: { text: string }) => (
    <span className="group relative inline-flex ml-2 cursor-help align-middle">
      <span className="text-blue-400 font-bold text-[10px] border border-blue-400/30 rounded-full w-4 h-4 flex items-center justify-center">i</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-800 text-[10px] text-slate-200 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl border border-white/10 z-[100] normal-case leading-relaxed font-medium tracking-tight">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></span>
      </span>
    </span>
  );

  const handleShare = (trace: any) => {
    const text = `TrustTrace Report: ${trace.websiteUrl} has a status of ${trace.outcome.toUpperCase()} for ${trace.productName}. Verified by the Guardian Network.`;
    navigator.clipboard.writeText(text);
    setShareStatus(trace._id);
    setTimeout(() => setShareStatus(null), 2000);
  };

  const highRiskUrls = useMemo(() => {
    const urlStats: Record<string, { total: number; failed: number }> = {};
    allTraces.forEach(t => {
      if (!urlStats[t.websiteUrl]) urlStats[t.websiteUrl] = { total: 0, failed: 0 };
      urlStats[t.websiteUrl].total++;
      if (t.outcome === 'not_delivered') urlStats[t.websiteUrl].failed++;
    });
    return Object.keys(urlStats).filter(url => 
      urlStats[url].total >= 2 && (urlStats[url].failed / urlStats[url].total) >= 0.4
    );
  }, [allTraces]);

  const filteredTraces = useMemo(() => {
    return allTraces.filter(t => {
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesSearch = t.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allTraces, categoryFilter, searchQuery]);

  const metrics = useMemo(() => {
    if (filteredTraces.length === 0) return { successRate: 0, totalValue: 0, riskCount: 0 };
    const delivered = filteredTraces.filter(t => t.outcome === 'delivered').length;
    const riskCount = new Set(filteredTraces.filter(t => highRiskUrls.includes(t.websiteUrl)).map(t => t.websiteUrl)).size;
    return {
      successRate: Math.round((delivered / filteredTraces.length) * 100),
      totalValue: filteredTraces.reduce((acc, t) => acc + (Number(t.price) || 0), 0).toLocaleString(),
      riskCount
    };
  }, [filteredTraces, highRiskUrls]);

  const dynamicTextColor = { color: isDark ? '#ffffff' : '#0f172a' };

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-pulse text-slate-500 font-black uppercase tracking-widest text-[10px]">Synchronizing Network Traces...</div>;

  return (
    <main className="max-w-6xl mx-auto py-32 px-6 space-y-12 relative z-10 transition-colors duration-500">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-block px-4 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.3em]">Network Feed</div>
          <h1 className="text-7xl font-extralight tracking-tighter leading-none" style={dynamicTextColor}>
            Collective <span className="text-blue-600 font-bold">Traces</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Filter by URL..." 
            className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none text-xs font-bold focus:border-blue-500 transition-all"
            style={dynamicTextColor} 
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none text-[10px] font-black uppercase tracking-widest"
            style={dynamicTextColor} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Sectors</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
      </header>

      {/* METRICS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl overflow-visible">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2 flex items-center">
            Network Health <InfoIcon text="The global delivery success rate for the currently filtered traces." />
          </div>
          <p className="text-5xl font-thin tracking-tighter">{metrics.successRate}% Success</p>
        </div>
        <div className={`p-8 rounded-[2.5rem] text-white shadow-xl overflow-visible ${metrics.riskCount > 0 ? 'bg-[#FF2D55]' : 'bg-slate-900'}`}>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2 flex items-center">
            Risk Alerts <InfoIcon text="Stores with high report failure rates detected by our audit engine." />
          </div>
          <p className="text-5xl font-thin tracking-tighter">{metrics.riskCount} Detected</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-xl overflow-visible">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center">
            Economic Volume <InfoIcon text="The total currency value monitored by Guardians in this view." />
          </div>
          <p className="text-5xl font-thin tracking-tighter" style={dynamicTextColor}>${metrics.totalValue}</p>
        </div>
      </div>

      {/* TRACE LIST WITH SHARE ACTION */}
      <div className="space-y-6">
        {filteredTraces.map((trace) => {
          const isHighRisk = highRiskUrls.includes(trace.websiteUrl);
          return (
            <div key={trace._id} className={`glass-card group p-8 rounded-[3rem] flex items-center justify-between transition-all hover:-translate-y-1 border ${isHighRisk ? 'border-[#FF2D55]/30 bg-rose-50/5' : 'border-white/10'}`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold" style={dynamicTextColor}>{trace.websiteUrl}</span>
                  {isHighRisk && <span className="px-3 py-1 rounded-full bg-[#FF2D55] text-white text-[8px] font-black uppercase animate-pulse">High Risk</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">{trace.productName}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currencyMap[trace.currency] || '$'}{trace.price}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleShare(trace)}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:scale-110 active:scale-90 transition-all border border-transparent hover:border-blue-500/30"
                >
                  <span className="text-xs">{shareStatus === trace._id ? '✅' : '🔗'}</span>
                </button>
                <span className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${
                  trace.outcome === 'delivered' ? 'bg-green-500' : 
                  trace.outcome === 'partial' ? 'bg-amber-500' : 'bg-rose-500'
                }`}>
                  {trace.outcome.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};