"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon, TwitterIcon } from "@/components/common/SocialIcons";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-obsidian-950 text-neutral-400 pt-14 sm:pt-18 pb-10 border-t border-amber-500/20 relative overflow-hidden tech-circuit-pattern">
      {/* Ambient Gold Glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* 4-Column Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-neutral-800/80">
          {/* Column 1: Brand Info & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-obsidian-950 font-black text-lg px-2.5 py-1 rounded-md tracking-wider shadow-md shadow-gold-500/20 font-serif">
                MSI
              </span>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white tracking-wider leading-none">
                  MOBILE<span className="text-gold-500">.COM</span>
                </span>
                <span className="text-[8px] text-gold-400/90 font-medium tracking-[0.2em] uppercase leading-tight mt-0.5">
                  Haute Tech Boutique
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
              MSI MOBILE.COM is Bangladesh&apos;s premier destination for 100% authentic titanium flagships, high-performance laptops, and luxury acoustic audio with official warranty.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-8 h-8 rounded-xl bg-obsidian-900 border border-neutral-800 hover:border-gold-500/60 text-neutral-400 hover:text-gold-400 flex items-center justify-center transition-all shadow-sm"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-8 h-8 rounded-xl bg-obsidian-900 border border-neutral-800 hover:border-gold-500/60 text-neutral-400 hover:text-gold-400 flex items-center justify-center transition-all shadow-sm"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-8 h-8 rounded-xl bg-obsidian-900 border border-neutral-800 hover:border-gold-500/60 text-neutral-400 hover:text-gold-400 flex items-center justify-center transition-all shadow-sm"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                aria-label="Twitter"
                className="w-8 h-8 rounded-xl bg-obsidian-900 border border-neutral-800 hover:border-gold-500/60 text-neutral-400 hover:text-gold-400 flex items-center justify-center transition-all shadow-sm"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-[0.2em] mb-4 border-l-2 border-gold-500 pl-3">
              Collections & Maison
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
              <li>
                <Link href="/about" className="hover:text-gold-300 transition-colors">
                  About Our Maison
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-300 transition-colors">
                  Concierge & Contact
                </Link>
              </li>
              <li>
                <a href="#faqs" className="hover:text-gold-300 transition-colors">
                  Frequently Asked Inquiries
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-gold-300 transition-colors">
                  Tech Journal & Reviews
                </a>
              </li>
              <li>
                <a href="#emi" className="hover:text-gold-300 transition-colors">
                  0% EMI Privileges (Up to 36 Months)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-[0.2em] mb-4 border-l-2 border-gold-500 pl-3">
              Client Privileges
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
              <li>
                <Link href="/account/orders" className="hover:text-gold-300 transition-colors">
                  Track Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-gold-300 transition-colors">
                  Exchange & Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-gold-300 transition-colors">
                  Official Warranty Coverage
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold-300 transition-colors">
                  Client Privacy Protocol
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gold-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-gold-300 transition-colors">
                  White-Glove Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-[0.2em] mb-4 border-l-2 border-gold-500 pl-3">
              Flagship Boutique
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-400 font-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span>Level 4, Block B, Jamuna Future Park / Bashundhara City, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <span>VIP Concierge: <strong className="text-white font-medium">+880 1999-MSIMOB</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                <span>concierge@msimobile.com.bd</span>
              </li>
              <li className="flex items-center gap-2.5 text-[11px] text-neutral-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Govt. Approved E-Commerce Registration</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Gateways Row */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <CreditCard className="w-4 h-4 text-gold-500" />
            <span className="font-light">Encrypted Bank-Grade Checkout:</span>
          </div>

          {/* Payment Badges with Luxury Subtle Styling */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 bg-obsidian-900 border border-neutral-800 text-neutral-300 font-bold text-[10px] rounded-lg tracking-wider">
              bKash
            </span>
            <span className="px-3 py-1 bg-obsidian-900 border border-neutral-800 text-neutral-300 font-bold text-[10px] rounded-lg tracking-wider">
              Nagad
            </span>
            <span className="px-3 py-1 bg-obsidian-900 border border-neutral-800 text-neutral-300 font-bold text-[10px] rounded-lg tracking-wider">
              VISA
            </span>
            <span className="px-3 py-1 bg-obsidian-900 border border-neutral-800 text-neutral-300 font-bold text-[10px] rounded-lg tracking-wider">
              MasterCard
            </span>
            <span className="px-3 py-1 bg-obsidian-900 border border-neutral-800 text-neutral-300 font-bold text-[10px] rounded-lg tracking-wider">
              AMEX
            </span>
            <span className="px-3 py-1 bg-obsidian-900 border border-amber-500/30 text-gold-400 font-bold text-[10px] rounded-lg tracking-wider">
              Cash on Delivery (COD)
            </span>
          </div>
        </div>

        {/* Bottom Copyright & Mandatory Developer Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 text-center sm:text-left">
          <p className="font-light">© {new Date().getFullYear()} MSI MOBILE.COM Bangladesh. All Rights Reserved.</p>

          {/* MANDATORY DEVELOPER CREDIT */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-obsidian-900 border border-gold-500/30 text-neutral-300 font-medium text-[11px] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>This website by Raihan - MERN Stack Developer</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
