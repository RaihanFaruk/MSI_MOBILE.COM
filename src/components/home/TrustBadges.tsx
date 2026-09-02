"use client";

import React from "react";
import { ShieldCheck, Truck, Lock, RefreshCw } from "lucide-react";

export const TrustBadges: React.FC = () => {
  const BADGES = [
    {
      icon: <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-brand-primary" />,
      title: "Genuine Products",
      desc: "100% official brand warranty",
      bgClass: "bg-blue-50/70 border-blue-100",
    },
    {
      icon: <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />,
      title: "Fast Delivery",
      desc: "Nationwide secure shipping",
      bgClass: "bg-emerald-50/70 border-emerald-100",
    },
    {
      icon: <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />,
      title: "Secure Payment",
      desc: "bKash, Nagad, Card & COD",
      bgClass: "bg-indigo-50/70 border-indigo-100",
    },
    {
      icon: <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />,
      title: "Easy Return",
      desc: "7-day easy refund policy",
      bgClass: "bg-amber-50/70 border-amber-100",
    },
  ];

  return (
    <section className="bg-white py-6 sm:py-8 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {BADGES.map((badge, index) => (
            <div
              key={index}
              className={`p-3.5 sm:p-4 rounded-xl border ${badge.bgClass} flex items-center gap-3 sm:gap-4 transition-all duration-200 hover:shadow-sm`}
            >
              <div className="p-2 sm:p-2.5 rounded-xl bg-white shadow-2xs shrink-0 flex items-center justify-center">
                {badge.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                  {badge.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5">
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
