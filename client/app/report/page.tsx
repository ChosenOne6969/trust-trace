"use client";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const [formData, setFormData] = useState({
    websiteUrl: '',
    productName: '',
    category: 'electronics',
    currency: 'USD',
    price: '',
    outcome: 'delivered'
  });
  
  const [allTraces, setAllTraces] = useState<any[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [status, setStatus] = useState('');
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

    const fetchNetworkData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/reports/recent/feed');
        setAllTraces(res.data);
      } catch (err) { console.error("Advice engine failed to sync"); }
    };
    fetchNetworkData();

    return () => {
      observer.disconnect();
      document.body.style.backgroundColor = ''; 
    };
  }, []);

  const riskAdvice = useMemo(() => {
    if (!formData.websiteUrl || formData.websiteUrl.length < 4) return null;
    const relatedTraces = allTraces.filter(t => 
      t.websiteUrl.toLowerCase().includes(formData.websiteUrl.toLowerCase())
    );
    if (relatedTraces.length === 0) return { status: 'neutral', msg: 'New entity detected. Be the first to verify.' };
    const failures = relatedTraces.filter(t => t.outcome === 'not_delivered').length;
    const failureRate = failures / relatedTraces.length;
    if (failureRate >= 0.4 && relatedTraces.length >= 2) {
      return { status: 'danger', msg: `WARNING: High failure rate (${Math.round(failureRate * 100)}%) detected.` };
    }
    return { status: 'safe', msg: 'This entity has a high trust rating in the network.' };
  }, [formData.websiteUrl, allTraces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');
    try {
      await axios.post('http://localhost:5000/api/reports/submit', formData, {
        headers: { 'x-auth-token': token }
      });
      setStatus('Trace committed successfully.');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setStatus('Failed to commit trace.');
    }
  };

  const dynamicTextColor = { color: isDark ? '#ffffff' : '#0f172a' };
  const inputStyle = "w-full p-5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 transition-all duration-300";
  const sectionWrapper = "group p-6 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/5 dark:hover:bg-white/5 border border-transparent hover:border-white/10";

  return (
    <main className="max-w-5xl mx-auto py-32 px-6 relative z-10 transition-colors duration-500">
      <header className="mb-12 space-y-4 text-center">
        <h1 className="text-6xl font-extralight tracking-tighter" style={dynamicTextColor}>
          Commit a <span className="text-blue-600 font-bold">Trace</span>
        </h1>
        <p className="text-slate-500 italic">Global accountability through collective intelligence.</p>
      </header>

      {riskAdvice && (
        <div className={`mb-8 p-6 rounded-[2rem] border transition-all duration-500 ${
          riskAdvice.status === 'danger' ? 'bg-rose-500/10 border-rose-500/30' : 
          riskAdvice.status === 'safe' ? 'bg-green-500/10 border-green-500/30' : 
          'bg-blue-500/10 border-blue-500/30'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              riskAdvice.status === 'danger' ? 'bg-rose-500' : 
              riskAdvice.status === 'safe' ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            <p className={`text-[11px] font-black uppercase tracking-widest ${
              riskAdvice.status === 'danger' ? 'text-rose-500' : 
              riskAdvice.status === 'safe' ? 'text-green-500' : 'text-blue-500'
            }`}>
              {riskAdvice.msg}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-10 rounded-[4rem] shadow-2xl space-y-4 border border-white/10">
        
        {/* SECTION 1: ENTITY INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={sectionWrapper}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 block mb-2">Entity URL</label>
            <input
              type="text" required className={inputStyle} style={dynamicTextColor}
              placeholder="e.g. storename.com"
              onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
            />
          </div>
          <div className={sectionWrapper}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 block mb-2">Product Name</label>
            <input
              type="text" required className={inputStyle} style={dynamicTextColor}
              placeholder="What did you buy?"
              onChange={(e) => setFormData({...formData, productName: e.target.value})}
            />
          </div>
        </div>

        {/* SECTION 2: CATEGORY & PRICE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={sectionWrapper}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 block mb-2">Category</label>
            <select className={inputStyle} style={dynamicTextColor} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion & Apparel</option>
              <option value="beauty">Beauty & Personal Care</option>
              <option value="home">Home & Kitchen</option>
              <option value="software">Software & Digital</option>
              <option value="luxury">Luxury Goods</option>
              <option value="services">Professional Services</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className={sectionWrapper}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 block mb-2">Currency</label>
            <select className={inputStyle} style={dynamicTextColor} onChange={(e) => setFormData({...formData, currency: e.target.value})}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
            </select>
          </div>
          <div className={sectionWrapper}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 block mb-2">Price Paid</label>
            <input
              type="number" required className={inputStyle} style={dynamicTextColor}
              placeholder="0.00"
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>
        </div>

        {/* SECTION 3: OUTCOME */}
        <div className={sectionWrapper}>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 block mb-4">Transaction Outcome</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => setFormData({...formData, outcome: 'delivered'})}
              className={`p-6 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all ${formData.outcome === 'delivered' ? 'bg-green-500 text-white scale-105 shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
            >
              Delivered
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, outcome: 'not_delivered'})}
              className={`p-6 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all ${formData.outcome === 'not_delivered' ? 'bg-rose-500 text-white scale-105 shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
            >
              Not Delivered
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, outcome: 'partial'})}
              className={`p-6 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all ${formData.outcome === 'partial' ? 'bg-amber-500 text-white scale-105 shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
            >
              Partial / Wrong Item
            </button>
          </div>
        </div>

        <div className="px-6 pt-4">
          <button 
            type="submit" 
            className="w-full py-7 rounded-[2.5rem] bg-blue-600 text-white font-black uppercase tracking-[0.4em] text-xs shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            Verify & Commit Trace
          </button>
          {status && <p className="text-center text-[10px] font-black uppercase tracking-widest text-blue-500 mt-6 animate-pulse">{status}</p>}
        </div>
      </form>
    </main>
  );
};