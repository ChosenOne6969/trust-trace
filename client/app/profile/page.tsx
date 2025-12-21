"use client";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myTraces, setMyTraces] = useState<any[]>([]);
  const [networkStats, setNetworkStats] = useState({ avgSuccess: 0 });
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
      document.body.style.backgroundColor = isDarkMode ? '#020617' : '#f8fafc';
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');
      try {
        const config = { headers: { 'x-auth-token': token } };
        const [userRes, tracesRes, globalRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', config),
          axios.get('http://localhost:5000/api/reports/my-traces', config),
          axios.get('http://localhost:5000/api/reports/recent/feed')
        ]);
        setUser(userRes.data);
        setMyTraces(Array.isArray(tracesRes.data) ? tracesRes.data : []);
        const globalData = globalRes.data;
        const delivered = globalData.filter((t: any) => t.outcome === 'delivered').length;
        setNetworkStats({ avgSuccess: Math.round((delivered / globalData.length) * 100) || 0 });
      } catch (err: any) { console.error("Sync error:", err.message); } 
      finally { setLoading(false); }
    };
    fetchProfileData();
    return () => {
      observer.disconnect();
      document.body.style.backgroundColor = ''; 
    };
  }, [router]);

  const metrics = useMemo(() => {
    if (myTraces.length === 0) return { successRate: 0, totalSpent: 0, monthlyCount: 0 };
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const monthlyTraces = myTraces.filter(t => new Date(t.timestamp) >= thirtyDaysAgo);
    const delivered = myTraces.filter(t => t.outcome === 'delivered').length;
    const spent = myTraces.reduce((acc, t) => acc + (Number(t.price) || 0), 0);
    return { successRate: Math.round((delivered / myTraces.length) * 100), totalSpent: spent.toLocaleString(), monthlyCount: monthlyTraces.length };
  }, [myTraces]);

  const dynamicTextColor = { color: isDark ? '#ffffff' : '#0f172a' };

  // TOOLTIP COMPONENT WITH COLLISION PREVENTION
  const InfoIcon = ({ text, position = 'up' }: { text: string; position?: 'up' | 'down' }) => (
    <span className="group relative inline-flex ml-2 cursor-help align-middle">
      <span className="text-blue-500 font-bold text-[10px] border border-blue-500/30 rounded-full w-4 h-4 flex items-center justify-center">i</span>
      <span className={`absolute left-1/2 -translate-x-1/2 w-56 p-3 bg-slate-800 text-[10px] text-slate-200 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl border border-white/10 z-[100] normal-case leading-relaxed font-medium tracking-tight ${
        position === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'
      }`}>
        {text}
        <span className={`absolute left-1/2 -translate-x-1/2 border-8 border-transparent ${
          position === 'up' ? 'top-full border-t-slate-800' : 'bottom-full border-b-slate-800'
        }`}></span>
      </span>
    </span>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-pulse text-slate-500 font-black tracking-widest uppercase text-[10px]">Decoding Dossier...</div>;

  return (
    <main className="max-w-6xl mx-auto py-32 px-6 space-y-12 relative z-10 transition-colors duration-500">
      <header className="space-y-4">
        <div className="inline-block px-4 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Identity Verified</div>
        <h1 className="text-7xl font-extralight tracking-tighter leading-none" style={dynamicTextColor}>
          Personal <span className="text-blue-600 font-bold">Dossier</span>
        </h1>
        <p className="text-xl font-light text-slate-500 italic">Welcome, {user?.name || 'Guardian'}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SUCCESS SCORE CARD - Tooltip set to "UP" to avoid collision with Average below it */}
        <div className="md:col-span-2 bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-visible">
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-400 mb-8 flex items-center">
            Guardian Success Score
            <InfoIcon position="up" text="Your personal delivery success rate based on all submitted traces." />
          </div>
          <div className="flex items-end gap-6">
            <div className="text-8xl font-thin tracking-tighter">{metrics.successRate}%</div>
            <div className="pb-4">
              <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center">
                Network Avg: {networkStats.avgSuccess}%
                <InfoIcon position="down" text="The global success rate of all Guardians in the network." />
              </div>
              <div className="w-24 h-1 bg-white/10 rounded-full mt-2">
                <div className="h-full bg-slate-400" style={{ width: `${networkStats.avgSuccess}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* MONTHLY ACTIVITY */}
        <div className="glass-card p-10 rounded-[3rem] border border-blue-500/20 shadow-xl flex flex-col justify-center overflow-visible">
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 flex items-center">
            30-Day Activity <InfoIcon text="Number of reports committed in the last 30 days." />
          </div>
          <div className="text-5xl font-thin tracking-tighter" style={dynamicTextColor}>+{metrics.monthlyCount}</div>
        </div>

        {/* VALUE TRACKED */}
        <div className="glass-card p-10 rounded-[3rem] border border-white/10 shadow-xl flex flex-col justify-center overflow-visible">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center">
            Value Tracked <InfoIcon text="The total economic value you have monitored." />
          </div>
          <div className="text-5xl font-thin tracking-tighter" style={dynamicTextColor}>${metrics.totalSpent}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-10 rounded-[3rem] border border-white/10 shadow-xl overflow-visible">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500 mb-4 flex items-center">
              Accountability Level <InfoIcon text="Your rank in the network hierarchy." />
            </div>
            <div className="text-4xl font-bold" style={dynamicTextColor}>Level {Math.floor(myTraces.length / 5) + 1}</div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[9px] uppercase font-black text-slate-500">
                <span>Progress</span>
                <span>{myTraces.length % 5} / 5</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${(myTraces.length % 5) * 20}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 flex items-center">
            Authenticated Trace Log <InfoIcon text="Your encrypted history of reports." />
          </div>
          <div className="space-y-4">
            {myTraces.map((trace) => (
              <div key={trace._id} className="glass-card group p-6 rounded-[2.5rem] flex items-center justify-between transition-all hover:-translate-y-1 border border-white/10">
                <div>
                  <div className="text-sm font-bold" style={dynamicTextColor}>{trace.websiteUrl}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{trace.productName} • ${trace.price}</div>
                </div>
                <span className={`px-4 py-2 rounded-xl text-[9px] font-black text-white uppercase shadow-md ${
                  trace.outcome === 'delivered' ? 'bg-green-500' : 
                  trace.outcome === 'partial' ? 'bg-amber-500' : 'bg-rose-500'
                }`}>
                  {trace.outcome.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};