"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, User } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/common/SocialIcons";
import { useAuth } from "@/lib/auth-context";

export const TopBar: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <>
      {/* Tier 1: Desktop / Laptop Top Utility Bar */}
      <div className="hidden md:block bg-navy-dark text-slate-300 text-xs py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Left: Location & Hotline */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-brand-accent" />
              <span>Dhaka, Bangladesh</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hotline: <strong className="text-white">+880 1999-MSIMOB</strong> (9AM - 10PM)</span>
            </div>
          </div>

          {/* Right: Social Media & Guarantee */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Same Day Delivery in Dhaka</span>
            </div>
            <div className="h-3 w-px bg-slate-700 hidden lg:block" />
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Follow Us:</span>
              <a
                href="#facebook"
                aria-label="Facebook"
                className="text-slate-300 hover:text-blue-400 transition-colors"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="text-slate-300 hover:text-rose-400 transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Compact Hotline strip */}
      <div className="md:hidden bg-navy-dark text-slate-300 text-[11px] py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-brand-accent" />
          <span>Dhaka, BD</span>
        </div>
        {user ? (
          <Link href="/account" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold truncate max-w-[180px]">
            <User className="w-3 h-3 text-blue-400" />
            <span>Hi, {profile?.full_name?.split(" ")[0] || user.email?.split("@")[0]}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>Hotline: <strong className="text-white">+880 1999-MSIMOB</strong></span>
          </div>
        )}
      </div>
    </>
  );
};
