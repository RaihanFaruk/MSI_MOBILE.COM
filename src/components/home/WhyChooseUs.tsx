"use client";

import React from "react";
import { ShieldCheck, RefreshCw, Truck, HeadphonesIcon, Award } from "lucide-react";

export const WhyChooseUs: React.FC = () => {
  const FEATURES = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand-primary" />,
      title: "Authentic Products Only",
      desc: "Every gadget is 100% genuine with official brand warranty & BTRC sticker approval.",
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-emerald-600" />,
      title: "7-Day Return Policy",
      desc: "Hassle-free replacement and refund if you encounter any manufacturer defect.",
    },
    {
      icon: <Truck className="w-8 h-8 text-indigo-600" />,
      title: "Nationwide Delivery",
      desc: "Super-fast 24h delivery inside Dhaka and 48-72h across all 64 districts in Bangladesh.",
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8 text-rose-500" />,
      title: "24/7 Customer Support",
      desc: "Dedicated tech experts available anytime via phone, WhatsApp & live chat to assist you.",
    },
  ];

  return (
    <section className="py-8 sm:py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-primary text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>THE MSI MOBILE PROMISE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-dark tracking-tight">
            Why Choose MSI MOBILE.COM?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Setting the standard for premium electronics e-commerce in Bangladesh
          </p>
        </div>

        {/* 4 Feature Columns (Desktop 4-col, Tablet/Mobile 2-col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((item, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 flex flex-col items-start"
            >
              <div className="p-3 rounded-xl bg-white shadow-2xs mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
