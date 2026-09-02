"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useStore();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Invalid Email", "Please enter a valid email address.", "warning");
      return;
    }
    setSubscribed(true);
    showToast("Subscribed Successfully!", "You are now on our VIP list for exclusive flash sales & discounts.", "success");
    setEmail("");
  };

  return (
    <section className="py-12 sm:py-16 bg-navy-darker text-white relative overflow-hidden border-b border-slate-800">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        {/* Icon Pill */}
        <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-4 shadow-inner">
          <Mail className="w-6 h-6" />
        </div>

        {/* Title & Subtext */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Stay Updated on New Drops & Flash Sales
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Subscribe to the MSI MOBILE newsletter and receive instant alert notifications, exclusive secret coupon codes & Eid specials directly in your inbox.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubscribe}
          className="mt-6 sm:mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-brand-primary text-white text-xs sm:text-sm px-4 py-3.5 rounded-xl placeholder-slate-500 focus:outline-none shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all shrink-0"
          >
            {subscribed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Subscribed!</span>
              </>
            ) : (
              <>
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <span className="block text-[11px] text-slate-500 mt-3">
          🔒 We respect your privacy. No spam ever. Unsubscribe anytime.
        </span>
      </div>
    </section>
  );
};
