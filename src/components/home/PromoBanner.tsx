"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const PromoBanner: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useStore();

  const handleCopyCode = () => {
    navigator.clipboard.writeText("MSIFIRST");
    setCopied(true);
    showToast("Privilege Code Copied", "Use code 'MSIFIRST' at checkout for 10% privilege savings.", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-3xl bg-obsidian-950 border border-gold-500/30 p-8 sm:p-12 text-white shadow-2xl overflow-hidden tech-grid-overlay">
          {/* Ambient Gold Blurs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            {/* Left Content */}
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold tracking-[0.2em] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Client Privilege Invitation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white tracking-tight leading-tight">
                Receive <span className="italic font-serif text-gold-400">10% Privilege Savings</span> on First Acquisition
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
                Enjoy instant savings on all flagships, workstations, and high-end audio horology. Valid for new boutique clients across Bangladesh.
              </p>

              {/* Coupon Code Pill */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Bespoke Code:</span>
                <div
                  onClick={handleCopyCode}
                  className="flex items-center gap-2.5 bg-obsidian-900 border border-gold-500/50 text-gold-300 px-4 py-2 rounded-xl font-mono font-black text-sm sm:text-base cursor-pointer hover:bg-gold-500/10 active:scale-95 transition-all shadow-md group"
                >
                  <span>MSIFIRST</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gold-500/80 group-hover:text-gold-400" />
                  )}
                </div>
                <span className="text-[11px] text-neutral-500">
                  {copied ? "Copied to clipboard" : "(Click to copy)"}
                </span>
              </div>
            </div>

            {/* Right Action Button */}
            <div className="shrink-0">
              <a
                href="#smartphones"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian-950 font-black text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-xl shadow-gold-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>Acquire Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
