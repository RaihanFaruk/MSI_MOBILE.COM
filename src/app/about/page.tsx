import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { CategoryNav } from "@/components/header/CategoryNav";
import { Footer } from "@/components/footer/Footer";
import {
  ShieldCheck,
  Truck,
  Award,
  Clock,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
  Headphones,
  Cpu,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — Premium Tech, Smartphones & Laptops in Bangladesh",
  description:
    "Learn about MSI MOBILE.COM, Bangladesh's premier technology retailer providing authentic smartphones, laptops, and gadgets with official brand warranty.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Header />
        <CategoryNav />

        {/* Hero Section */}
        <div className="bg-gradient-to-b from-navy-dark via-slate-900 to-navy-dark text-white py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-semibold">
              <Award className="w-4 h-4" />
              <span>Authentic Tech Destination Since 2020</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Empowering Bangladesh with <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
                Next-Gen Authentic Technology
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              At MSI MOBILE.COM, we connect Bangladeshi tech enthusiasts, gamers, and professionals
              with 100% genuine smartphones, high-performance laptops, and premium gadgets backed by
              official manufacturer warranty.
            </p>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-xs text-center">
                <span className="text-2xl sm:text-3xl font-black text-blue-400 block">50,000+</span>
                <span className="text-xs text-slate-400 mt-1 block">Happy Tech Lovers</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-xs text-center">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">100%</span>
                <span className="text-xs text-slate-400 mt-1 block">Genuine & Verified</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-xs text-center">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 block">64</span>
                <span className="text-xs text-slate-400 mt-1 block">Districts Delivery</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-xs text-center">
                <span className="text-2xl sm:text-3xl font-black text-purple-400 block">24/7</span>
                <span className="text-xs text-slate-400 mt-1 block">Support & Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Story / Mission / Vision Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 space-y-12">
          {/* Who We Are */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Our Story
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Who We Are & What Drives Us
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Founded with a mission to eliminate counterfeit tech and unfair price gouging in Bangladesh,
                MSI MOBILE.COM has grown into one of the country’s most trusted retail and online tech stores.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Whether you need the newest flagship smartphone, a beastly gaming laptop, or true wireless
                noise-cancelling earbuds, we source directly from authorized distribution channels,
                ensuring complete peace of mind with genuine warranties and reliable post-purchase support.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Official Warranty Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>0% EMI Available</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 space-y-2">
                <Building2 className="w-6 h-6 text-brand-primary" />
                <h3 className="font-bold text-sm text-slate-900">Physical Outlets</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Experience products hands-on at our prime Dhaka flagship stores.
                </p>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 space-y-2">
                <Truck className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Super Fast Delivery</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  24-hour Dhaka delivery and 2-3 days nationwide courier dispatch.
                </p>
              </div>
              <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-5 space-y-2">
                <Cpu className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Curated Tech</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Only the top-rated global tech brands (Apple, Samsung, MSI, Asus, Xiaomi).
                </p>
              </div>
              <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-5 space-y-2">
                <Headphones className="w-6 h-6 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Dedicated Support</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct hotline and WhatsApp tech support for quick resolutions.
                </p>
              </div>
            </div>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-primary flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To democratize access to authentic modern technology across all 64 districts of Bangladesh
                by delivering authentic products, transparent pricing, fast fulfillment, and empathetic
                after-sales customer service.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To become Bangladesh’s benchmark e-commerce platform for genuine electronics, empowering
                students, creators, and professionals to work, learn, and play with world-class gear.
              </p>
            </div>
          </div>

          {/* Why Choose MSI MOBILE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Customer First Guarantee
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Why Buy From MSI MOBILE.COM?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">100% Genuine Tech</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every product is sourced from authorized global distributors with verified IMEI & serial numbers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Fast Express Delivery</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Same-day or next-day delivery inside Dhaka and 48-72 hours doorstep delivery across Bangladesh.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">7-Day Replacement</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hassle-free replacement policy for manufacturing defects and transparent warranty claims.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Expert Support</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Get pre-purchase consultation and post-purchase setup help from dedicated tech specialists.
                </p>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Ready to explore our latest tech?</h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Discover official smartphones, laptops, smartwatches, and gadgets with nationwide delivery.
                </p>
              </div>
              <Link
                href="/products"
                className="bg-white hover:bg-slate-100 text-brand-primary font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
