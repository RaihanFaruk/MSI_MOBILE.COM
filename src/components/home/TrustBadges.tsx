"use client";

import React from "react";
import { ShieldCheck, Truck, Lock, RefreshCw } from "lucide-react";

export const TrustBadges: React.FC = () => {
  const BADGES = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-gold-500" />,
      title: "Authentic Masterpieces",
      desc: "100% official brand warranty & BTRC certified",
    },
    {
      icon: <Truck className="w-5 h-5 text-gold-500" />,
      title: "Concierge White-Glove",
      desc: "Fast & insured nationwide transit",
    },
    {
      icon: <Lock className="w-5 h-5 text-gold-500" />,
      title: "Encrypted Transactions",
      desc: "256-bit secure bank & mobile checkout",
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-gold-500" />,
      title: "Client Satisfaction",
      desc: "7-day effortless return & exchange",
    },
  ];

  return (
    <section className="bg-white py-8 sm:py-10 border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {BADGES.map((badge, index) => (
            <div
              key={index}
              className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] border border-neutral-200/80 hover:border-gold-500/40 flex items-center gap-3.5 transition-all duration-300 hover:shadow-sm"
            >
              <div className="p-2.5 rounded-xl bg-obsidian-950 text-gold-400 border border-gold-500/30 shrink-0 flex items-center justify-center shadow-xs">
                {badge.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate tracking-tight">
                  {badge.title}
                </h4>
                <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5 font-light">
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
