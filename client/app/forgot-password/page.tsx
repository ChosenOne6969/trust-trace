"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/auth/reset-password', { 
        email: email.trim(), 
        newPassword 
      });
      alert("Identity restored! Please log in carefully.");
      router.push('/login');
    } catch (err: any) {
      alert(err.response?.data?.msg || "Reset failed. Check email spelling.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-slate-800 tracking-tight">Restore Identity</h1>
          <p className="text-slate-500 text-sm mt-2">Reset your credentials carefully.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="Correct email (e.g. gmail.com)"
              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 transition"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium transition shadow-sm disabled:bg-slate-300"
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <Link href="/login" className="text-sm text-blue-600 font-semibold hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
};