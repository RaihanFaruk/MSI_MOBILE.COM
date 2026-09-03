"use client";

import React from "react";
import { ShieldCheck, RefreshCw, Truck, HeadphonesIcon, Crown } from "lucide-react";

export const WhyChooseUs: React.FC = () => {
  const FEATURES = [
    {
      icon: <ShieldCheck className="w-7 h-7 text-gold-500" />,
      title: "100% Genuine Provenance",
      desc: "Every device is sealed, original, official brand-backed with BTRC verification stickers.",
    },
    {
      icon: <RefreshCw className="w-7 h-7 text-gold-500" />,
      title: "Effortless 7-Day Exchange",
      desc: "Guaranteed replacement policy with dedicated technical support if any flaw arises.",
    },
    {
      icon: <Truck className="w-7 h-7 text-gold-500" />,
      title: "VIP White-Glove Transit",
      desc: "Same-day express delivery in Dhaka and insured priority courier to all 64 districts.",
    },
    {
      icon: <HeadphonesIcon className="w-7 h-7 text-gold-500" />,
      title: "24/7 Dedicated Concierge",
      desc: "Personal technology advisors standing by via phone, WhatsApp & live chat for assistance.",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-600 text-xs font-bold tracking-[0.2em] uppercase mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>THE MSI PROMISE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-neutral-950 tracking-tight">
            Why Discerning Clients <span className="italic font-serif">Choose MSI</span>
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full mx-auto mt-2" />
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-[#FAF9F6] border border-neutral-200/80 hover:border-gold-500/50 hover:bg-white hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
            >
              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-gold-500/30 shadow-sm mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 mb-1.5 tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
