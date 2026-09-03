import React from "react";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { Home, Search, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-950 text-white relative overflow-hidden tech-circuit-pattern">
        {/* Glow ambient decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full text-center relative z-10 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center mx-auto text-brand-primary">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-rose-400">
              404
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              পৃষ্ঠাটি খুঁজে পাওয়া যায়নি (Page Not Found)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              আপনি যে পেজটি খুঁজছেন তা হয়তো সরানো হয়েছে, নাম পরিবর্তন করা হয়েছে অথবা সাময়িকভাবে অনুপলব্ধ।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>হোমে ফিরে যান</span>
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>সব প্রোডাক্ট দেখুন</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
