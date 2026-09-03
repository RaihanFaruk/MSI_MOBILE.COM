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
    showToast("Coupon Copied!", "Use coupon code 'MSIFIRST' during checkout for 10% off.", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="py-6 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-700 via-brand-primary to-indigo-800 p-6 sm:p-10 text-white shadow-xl overflow-hidden tech-grid-overlay">
          {/* Decorative glowing background blurs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            {/* Left Content */}
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-blue-100 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>EXCLUSIVE FIRST ORDER OFFER</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Get 10% Off Your First Order
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Enjoy instant savings on all flagships, laptops, and audio gear. Valid for all new registered customers in Bangladesh.
              </p>

              {/* Coupon Code Pill */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                <span className="text-xs font-semibold text-blue-200">Use Code:</span>
                <div
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 bg-white text-brand-primary px-3.5 py-1.5 rounded-lg font-mono font-extrabold text-sm sm:text-base cursor-pointer hover:bg-blue-50 active:scale-95 transition-all shadow-md group"
                >
                  <span>MSIFIRST</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-brand-primary" />
                  )}
                </div>
                <span className="text-[11px] text-blue-200">
                  {copied ? "Copied to clipboard!" : "(Click to copy)"}
                </span>
              </div>
            </div>

            {/* Right Action Button */}
            <div className="shrink-0">
              <a
                href="#smartphones"
                className="inline-flex items-center gap-2 bg-white text-brand-primary hover:bg-blue-50 active:scale-95 font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
