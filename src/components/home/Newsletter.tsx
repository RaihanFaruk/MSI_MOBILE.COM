"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, Sparkles } from "lucide-react";
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
    showToast("VIP Invitation Confirmed", "You are now enrolled in the MSI Private Client Registry.", "success");
    setEmail("");
  };

  return (
    <section className="py-16 sm:py-20 bg-obsidian-950 text-white relative overflow-hidden border-b border-amber-500/15 tech-circuit-pattern">
      {/* Ambient Gold Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        {/* Icon Pill */}
        <div className="inline-flex p-3.5 rounded-2xl bg-gold-500/10 text-gold-400 border border-gold-500/30 mb-5 shadow-inner">
          <Mail className="w-6 h-6" />
        </div>

        {/* Title & Subtext */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-gold-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
          <Sparkles className="w-3 h-3" />
          <span>PRIVATE CLIENT REGISTRY</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white tracking-tight">
          Receive Private Allocations & <span className="italic font-serif text-gold-400">Previews</span>
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-neutral-400 mt-2 max-w-xl mx-auto leading-relaxed font-light">
          Join our distinguished circle for confidential drop alerts, exclusive allocation privileges, and invitation-only previews.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubscribe}
          className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="email"
              aria-label="Email address for private client registry"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="w-full bg-obsidian-900/90 border border-amber-500/25 focus:border-gold-500 text-white text-xs sm:text-sm px-4 py-3.5 rounded-xl placeholder-neutral-500 focus:outline-none shadow-inner"
            />
          </div>

          <button
            type="submit"
            aria-label="Subscribe to private registry"
            className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 active:scale-95 text-obsidian-950 font-black text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-gold-500/20 transition-all shrink-0 cursor-pointer"
          >
            {subscribed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Enrolled</span>
              </>
            ) : (
              <>
                <span>Join Registry</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <span className="block text-[11px] text-neutral-500 mt-4 font-light">
          🔒 Strict client confidentiality assured. Unsubscribe at your discretion.
        </span>
      </div>
    </section>
  );
};
