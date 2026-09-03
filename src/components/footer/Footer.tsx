"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon, TwitterIcon } from "@/components/common/SocialIcons";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-dark text-slate-300 pt-12 sm:pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* 4-Column Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand Info & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-brand-accent text-white font-black text-lg px-2.5 py-1 rounded-md tracking-wider shadow-sm">
                MSI
              </span>
              <span className="font-extrabold text-lg text-white tracking-tight">
                MOBILE<span className="text-blue-400">.COM</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              MSI MOBILE.COM is Bangladesh&apos;s premier destination for 100% authentic smartphones, gaming laptops, and cutting-edge tech accessories with official warranty.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-all"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                aria-label="Twitter"
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition-all"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-primary pl-2.5">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#about" className="hover:text-blue-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-blue-400 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-blue-400 transition-colors">
                  Frequently Asked Questions (FAQs)
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-blue-400 transition-colors">
                  Tech News & Blog
                </a>
              </li>
              <li>
                <a href="#emi" className="hover:text-blue-400 transition-colors">
                  0% EMI Facility (Up to 36 Months)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-primary pl-2.5">
              Customer Service
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href="/account/orders" className="hover:text-blue-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-blue-400 transition-colors">
                  Returns & Replacements Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-blue-400 transition-colors">
                  Official Warranty Claim Info
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-blue-400 transition-colors">
                  Shipping & Delivery Times
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-primary pl-2.5">
              Contact & Store Info
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                <span>Level 4, Block B, Jamuna Future Park / Bashundhara City, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hotline: <strong className="text-white">+880 1999-MSIMOB</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@msimobile.com.bd</span>
              </li>
              <li className="flex items-center gap-2.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Govt. Approved E-Commerce Registration</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Gateways Row */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CreditCard className="w-4 h-4 text-slate-300" />
            <span>We Accept Secure Payments via:</span>
          </div>

          {/* Payment Badges (bKash, Nagad, Visa, Mastercard, AMEX, COD) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 bg-pink-700/80 text-white font-extrabold text-[11px] rounded-md tracking-wider shadow-xs">
              bKash
            </span>
            <span className="px-3 py-1 bg-orange-600/80 text-white font-extrabold text-[11px] rounded-md tracking-wider shadow-xs">
              Nagad
            </span>
            <span className="px-3 py-1 bg-blue-700/80 text-white font-extrabold text-[11px] rounded-md tracking-wider shadow-xs">
              VISA
            </span>
            <span className="px-3 py-1 bg-amber-600/80 text-white font-extrabold text-[11px] rounded-md tracking-wider shadow-xs">
              MasterCard
            </span>
            <span className="px-3 py-1 bg-sky-700/80 text-white font-extrabold text-[11px] rounded-md tracking-wider shadow-xs">
              AMEX
            </span>
            <span className="px-3 py-1 bg-emerald-700/80 text-white font-extrabold text-[11px] rounded-md tracking-wider shadow-xs">
              Cash on Delivery (COD)
            </span>
          </div>
        </div>

        {/* Bottom Copyright & Mandatory Developer Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
          <p>© {new Date().getFullYear()} MSI MOBILE.COM Bangladesh. All Rights Reserved.</p>

          {/* MANDATORY DEVELOPER CREDIT */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-200 font-medium">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>This website by Raihan - MERN Stack Developer</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
