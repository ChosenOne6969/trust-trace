"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Step 2: Hybrid Identity - Create new user entry and retrieve JWT
      // We trim the email to prevent accidental space-related login failures
      const submissionData = { ...formData, email: formData.email.trim() };
      const res = await axios.post('http://localhost:5000/api/auth/register', submissionData);
      
      // Store token to establish the session immediately
      localStorage.setItem('token', res.data.token);
      
      alert("Account created! You are now a verified contributor to the collective memory.");
      
      // Force a full refresh to update the Navbar state and clear memory
      window.location.href = "/";
    } catch (err: any) {
      alert(err.response?.data?.msg || "Signup failed. This email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-slate-800 tracking-tight">Join TrustTrace</h1>
          <p className="text-slate-500 text-sm mt-2 font-light">Create an identity to start tracing experiences.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your name" 
              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 transition"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 transition"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Create a secure password" 
                className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 transition"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-tighter"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-medium transition shadow-sm ${
              loading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-slate-800 hover:bg-slate-900 text-white active:scale-95'
            }`}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};