"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { RefreshCw, Home, AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-950 text-white relative overflow-hidden tech-circuit-pattern">
        <div className="max-w-md w-full text-center relative z-10 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-rose-400 shadow-2xl flex items-center justify-center mx-auto">
            <AlertOctagon className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              কিছু একটা অপ্রত্যাশিত সমস্যা হয়েছে
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              {error?.message || "পেজটি লোড করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।"}
            </p>
            {error?.digest && (
              <p className="text-[10px] text-slate-600 font-mono">Error Reference: {error.digest}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>আবার চেষ্টা করুন</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>হোমে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
