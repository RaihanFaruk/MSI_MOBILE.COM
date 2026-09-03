"use client";

import React from "react";
import { MapPin, Phone, Sparkles } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/common/SocialIcons";

export const TopBar: React.FC = () => {
  return (
    <>
      {/* Tier 1: Desktop Luxury Top Utility Bar */}
      <div className="hidden md:block bg-obsidian-950 text-neutral-400 text-xs py-2 border-b border-amber-500/15 tracking-wider">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Left: Location & Concierge Hotline */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-neutral-300 hover:text-gold-400 transition-colors cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-gold-500" />
              <span className="text-[11px] font-medium tracking-wide">Dhaka Flagship Boutique, Bangladesh</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-300 hover:text-gold-400 transition-colors cursor-pointer">
              <Phone className="w-3.5 h-3.5 text-gold-500" />
              <span className="text-[11px]">VIP Concierge: <strong className="text-gold-400 font-semibold tracking-wider">+880 1999-MSIMOB</strong></span>
            </div>
          </div>

          {/* Right: Guarantee & Social Links */}
          <div className="flex items-center gap-5">
            <div className="hidden lg:flex items-center gap-1.5 text-neutral-400 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>100% Authentic Guaranteed • Official Warranty</span>
            </div>
            <div className="h-3 w-px bg-neutral-800 hidden lg:block" />
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Follow:</span>
              <a
                href="#facebook"
                aria-label="Facebook"
                className="text-neutral-400 hover:text-gold-400 transition-colors"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="text-neutral-400 hover:text-gold-400 transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="text-neutral-400 hover:text-gold-400 transition-colors"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Compact Luxury Hotline strip */}
      <div className="md:hidden bg-obsidian-950 text-neutral-300 text-[11px] py-1.5 px-4 flex items-center justify-between border-b border-amber-500/15">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-gold-500" />
          <span className="text-neutral-400 font-medium">MSI Boutique • Official Warranty</span>
        </div>
        <a
          href="tel:+8801999674662"
          className="text-gold-400 font-bold hover:underline flex items-center gap-1 tracking-wide"
        >
          <Phone className="w-3 h-3" />
          <span>Call Concierge</span>
        </a>
      </div>
    </>
  );
};
