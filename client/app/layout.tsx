"use client";
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Initial theme sync
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        {/* pt-24 ensures hero section isn't hidden under the navbar */}
        <div className="pt-24 px-6 md:px-12 max-w-7xl mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
};