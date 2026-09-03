"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Flame } from "lucide-react";

interface HeroSlide {
  id: number;
  badge: string;
  headline: string;
  headlineHighlight: string;
  subtext: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
  image: string;
  productName: string;
  offerTag: string;
}

const SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: "EID SPECIAL PROMOTION",
    headline: "Upgrade Your",
    headlineHighlight: "Tech Life",
    subtext: "Experience next-generation performance with authentic flagships, official warranty, and lightning-fast nationwide delivery across Bangladesh.",
    primaryBtnText: "Shop Now",
    primaryBtnLink: "#smartphones",
    secondaryBtnText: "View Deals",
    secondaryBtnLink: "#flash-sale",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    productName: "iPhone 16 Pro Max • Titanium",
    offerTag: "Save Up To ৳16,000",
  },
  {
    id: 2,
    badge: "AI POWERED PERFORMANCE",
    headline: "Unleash Pure",
    headlineHighlight: "Gaming Power",
    subtext: "Dominate every battle with Intel 14th Gen & RTX 4090 gaming beasts from MSI, ASUS ROG & Lenovo Legion with 2-Year official warranty.",
    primaryBtnText: "Explore Laptops",
    primaryBtnLink: "#laptops",
    secondaryBtnText: "Compare Specs",
    secondaryBtnLink: "#laptops",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
    productName: "MSI Raider GE78 HX (RTX 4080)",
    offerTag: "Free Gaming Backpack",
  },
  {
    id: 3,
    badge: "PREMIUM WEARABLES & AUDIO",
    headline: "Immersive Sound &",
    headlineHighlight: "Smart Lifestyle",
    subtext: "Discover top-tier noise cancellation headphones, smartwatches and high-capacity fast charging accessories from Sony, Apple & Anker.",
    primaryBtnText: "Discover Gadgets",
    primaryBtnLink: "#gadgets",
    secondaryBtnText: "Latest Arrivals",
    secondaryBtnLink: "#new-arrivals",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    productName: "Sony WH-1000XM5 • ANC",
    offerTag: "Flat 16% Discount",
  },
];

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <section className="relative bg-navy-dark text-white overflow-hidden tech-circuit-pattern">
      {/* Background glowing gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-4 sm:space-y-6 text-left">
            {/* Promotion Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/30 border border-blue-400/30 backdrop-blur-sm text-blue-300 text-xs sm:text-sm font-semibold tracking-wide shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <span>{slide.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              {slide.headline}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400">
                {slide.headlineHighlight}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
              {slide.subtext}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <a
                href={slide.primaryBtnLink}
                className="bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl flex items-center gap-2 text-sm sm:text-base shadow-lg shadow-blue-600/30 transition-all duration-200"
              >
                <span>{slide.primaryBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={slide.secondaryBtnLink}
                className="border-2 border-white/40 hover:border-white hover:bg-white/10 active:scale-95 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base backdrop-blur-sm transition-all duration-200"
              >
                <span>{slide.secondaryBtnText}</span>
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 flex items-center gap-4 sm:gap-6 text-xs text-slate-300 border-t border-slate-800/80 w-full">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Official Warranty</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Zero% EMI Available</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Product Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            {/* Offer floating pill */}
            <div className="absolute top-2 right-4 sm:right-10 z-20 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-rose-400/50 animate-bounce">
              {slide.offerTag}
            </div>

            {/* Product image with glowing shadow */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
              {/* Backlight circular glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 to-indigo-500/20 rounded-full blur-2xl transform scale-90" />

              <div className="relative w-full h-full animate-float">
                <Image
                  src={slide.image}
                  alt={slide.productName}
                  fill
                  priority
                  sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
                  className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>

            {/* Product Label */}
            <div className="mt-2 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/80 text-xs font-semibold text-slate-200 shadow-md">
              {slide.productName}
            </div>
          </div>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "w-8 bg-brand-primary"
                    : "w-2 bg-slate-600 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          {/* Prev/Next arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
              aria-label="Previous Slide"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
              aria-label="Next Slide"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
